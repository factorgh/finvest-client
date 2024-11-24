"use client";
import BulkImage from "@/app/(components)/bulkImage";
import { toTwoDecimalPlaces } from "@/lib/helper";
import {
  useDeleteInvestmentMutation,
  useGetAllInvestmentsQuery,
  useUpdateInvestmentMutation,
} from "@/services/investment";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
} from "antd";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

/*************  ✨ Codeium Command ⭐  *************/
/**
 * WealthTable component renders a table of general investment expenses with functionalities
 * to add, edit, and delete entries. It includes a search feature for filtering data and a drawer
 * form for editing entries. The component uses Ant Design for UI elements and integrates with
 * a backend API to fetch and mutate investment data.
 */
/******  9086d653-a04c-4e0b-bac6-b7052991ffc2  *******/ const LoanTable =
  () => {
    const searchInput = useRef(null);
    const { data: investmentData, isFetching: investmentLoading } =
      useGetAllInvestmentsQuery<any>(null);
    console.log(
      "-------------------------InvestmentData-------------------------"
    );
    console.log(investmentData?.data);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editRentalId, setEditRentalId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [users, setUsers] = useState([]);
    const [form] = Form.useForm();

    const [updateInvestment, { isLoading }] = useUpdateInvestmentMutation();
    const [deleteInvestment] = useDeleteInvestmentMutation();
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    console.log(selectedFiles);

    const handleFileListChange = (fileList: any[]) => {
      setSelectedFiles(fileList);
    };

    const handleCloseDrawer = () => {
      setIsDrawerVisible(false);
      form.resetFields();
      setEditRentalId(null);
      setIsEditMode(false);
    };
    const showEditDrawer = (investment: any) => {
      setIsEditMode(true);
      setEditRentalId(investment.id);

      form.setFieldsValue({
        name: investment.name,
        principal: toTwoDecimalPlaces(investment.principal),
        managementFee: toTwoDecimalPlaces(investment.managementFee),
        performanceYield: toTwoDecimalPlaces(investment.performanceYield),
        guaranteedRate: investment.guaranteedRate,
      });

      setIsDrawerVisible(true);
    };
    const handleFormSubmit = async (values: any) => {
      try {
        const formattedValues = {
          ...values,
          managementFee: toTwoDecimalPlaces(values.managementFee),
          performanceYield: toTwoDecimalPlaces(values.performanceYield),
          principal: toTwoDecimalPlaces(values.principal),
        };

        if (isEditMode) {
          await updateInvestment({
            id: editRentalId,
            expenseData: formattedValues,
          }).unwrap();
          toast.success("Investment updated successfully");
        } else {
          toast.success("New investment added successfully");
        }

        setIsDrawerVisible(false);
        form.resetFields();
      } catch (error: any) {
        toast.error("Failed to save investment entry: " + error?.data?.message);
      }
    };

    const handleDelete = async (id: any) => {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Do you want to delete this entry?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          await deleteInvestment(id).unwrap();
          toast.success("Entry deleted successfully");
        }
      } catch (error: any) {
        toast.error("Failed to delete entry: " + error?.message);
      }
    };

    const getColumnSearchProps = (dataIndex: any) => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            style={{ marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value: any, record: any) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : "",
    });

    const columns = [
      {
        title: "Admin",
        dataIndex: "name",
        key: "name",
        ...getColumnSearchProps("name"),
      },
      {
        title: "Principal",
        dataIndex: "principal",
        key: "principal",
        ...getColumnSearchProps("principal"),
        render: (value: any) => toTwoDecimalPlaces(value), // Format principal
      },
      {
        title: "Guaranteed Return",
        dataIndex: "guaranteedRate",
        key: "guaranteedRate",
        ...getColumnSearchProps("guaranteedRate"),
      },
      {
        title: "Performance Yield",
        dataIndex: "performanceYield",
        key: "performanceYield",
        ...getColumnSearchProps("performanceYield"),
        render: (value: any) => toTwoDecimalPlaces(value), // Format performance yield
      },
      {
        title: "Management Fee",
        dataIndex: "managementFee",
        key: "managementFee",
        ...getColumnSearchProps("managementFee"),
        render: (value: any) => `${toTwoDecimalPlaces(value)}%`, // Add "%" suffix
      },
      {
        title: "Total Accrued Return",
        dataIndex: "totalAccruedReturn",
        key: "totalAccruedReturn",
        ...getColumnSearchProps("totalAccruedReturn"),
        render: (value: any) => `$${toTwoDecimalPlaces(value)}`, // Format with currency
      },
      {
        title: "Action",
        key: "action",
        render: (text: any, record: any) => (
          <div className="flex gap-3">
            <EditOutlined
              className="text-blue-500"
              onClick={() => showEditDrawer(record)}
            />
            <DeleteOutlined
              onClick={() => handleDelete(record.id)}
              className="text-red-500"
              style={{ marginLeft: "10px" }}
            />
          </div>
        ),
      },
    ];

    return (
      <>
        <Table
          pagination={{
            pageSize: 10,
          }}
          loading={investmentLoading}
          columns={columns}
          dataSource={investmentData?.data}
          // scroll={{ x: 1000 }}
          className="border border-slate-200 rounded-md"
          rowKey="id" // Correct rowKey
        />
        <Drawer
          title="Edit Expense"
          placement="right"
          width="50%" // Adjust to center the drawer
          onClose={handleCloseDrawer}
          open={isDrawerVisible}
        >
          <Form
            form={form}
            onFinish={handleFormSubmit}
            layout="vertical"
            hideRequiredMark
          >
            <Row gutter={16}>
              {/* User Selection */}
              <Col span={12}>
                <Form.Item
                  name="userId"
                  label="User"
                  rules={[{ required: true, message: "Please select a user" }]}
                >
                  <Select
                    placeholder="Select a user"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={users?.map((user: any) => ({
                      value: user._id,
                      label: user.name,
                    }))}
                  />
                </Form.Item>
              </Col>

              {/* Principal */}
              <Col span={12}>
                <Form.Item
                  name="principal"
                  label="Principal"
                  rules={[
                    { required: true, message: "Please enter the principal" },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter principal"
                    style={{ width: "100%" }}
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Performance Yield */}
              <Col span={12}>
                <Form.Item
                  name="performanceYield"
                  label="Performance Yield"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the performance yield",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter performance yield"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              {/* Guaranteed Rate */}
              <Col span={12}>
                <Form.Item
                  name="guaranteedRate"
                  label="Guaranteed Rate"
                  rules={[
                    {
                      required: true,
                      message: "Please select a guaranteed rate",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select guaranteed rate"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={Array.from({ length: 100 }, (_, i) => ({
                      value: i + 1,
                      label: `${i + 1}%`,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Management Fee */}
              <Col span={12}>
                <Form.Item
                  name="managementFee"
                  label="Management Fee"
                  rules={[
                    {
                      required: true,
                      message: "Please select a management fee",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select management fee"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={Array.from({ length: 100 }, (_, i) => ({
                      value: i + 1,
                      label: `${i + 1}%`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="quarter"
                  label="Quater"
                  rules={[
                    { required: true, message: "Please select a quater" },
                  ]}
                >
                  <Select
                    placeholder="Select management fee"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={["Q1", "Q2", "Q3", "Q4"].map((quater) => ({
                      value: quater,
                      label: quater,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* File Upload */}
              <BulkImage onFileListChange={handleFileListChange} />
            </Row>

            <Form.Item>
              <Button
                className="w-full mt-6"
                type="primary"
                htmlType="submit"
                loading={isLoading}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      </>
    );
  };

export default LoanTable;