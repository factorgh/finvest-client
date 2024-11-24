"use client";
import { useGetUsersQuery } from "@/services/auth";
import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { TabsProps } from "antd/es/tabs";
import { useEffect, useState } from "react";
import Wrapper from "../wealth/_components/wapper";

const { confirm } = Modal;

interface RecordType {
  key: number;
  id: string;
  amount: number;
  date: string;
  status: string;
  userName: string; // Added customer name as userName
}

interface DataSourceType {
  withdrawals: RecordType[];
  payments: RecordType[];
}

const sampleWithdrawals: RecordType[] = [
  {
    key: 1,
    id: "user_1",
    userName: "John Doe", // Example name
    amount: 1000,
    date: "2024-11-01",
    status: "Pending",
  },
  {
    key: 2,
    id: "user_2",
    userName: "Jane Smith", // Example name
    amount: 2000,
    date: "2024-11-15",
    status: "Completed",
  },
];

const samplePayments: RecordType[] = [
  {
    key: 1,
    id: "user_1",
    userName: "John Doe", // Example name
    amount: 500,
    date: "2024-11-10",
    status: "Processed",
  },
  {
    key: 2,
    id: "user_2",
    userName: "Jane Smith", // Example name
    amount: 1500,
    date: "2024-11-18",
    status: "Pending",
  },
];

const CashOutPage: React.FC = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<any>([]);
  const [editingRecord, setEditingRecord] = useState<RecordType | null>(null);
  const [activeTab, setActiveTab] = useState<"withdrawals" | "payments">(
    "withdrawals"
  );
  const { data, isFetching } = useGetUsersQuery(null);
  const [dataSource, setDataSource] = useState<DataSourceType>({
    withdrawals: sampleWithdrawals,
    payments: samplePayments,
  });

  useEffect(() => {
    setUsers(data?.allUsers || []);
  }, [data]);

  const showDrawer = (record?: RecordType) => {
    setEditingRecord(record || null);
    form.resetFields();
    setIsDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerVisible(false);
    setEditingRecord(null);
  };

  const confirmAction = (values: Record<string, any>) => {
    confirm({
      title: `Are you sure you want to create this ${
        activeTab === "withdrawals" ? "withdrawal" : "payment"
      }?`,
      content: `Amount: ${values.amount}, Date: ${values.date?.format(
        "YYYY-MM-DD"
      )}, Status: ${values.status}`,
      onOk() {
        handleFormSubmit(values);
      },
    });
  };

  const handleFormSubmit = (values: Record<string, any>) => {
    const newRecord: RecordType = {
      ...values,
      id: `user_${dataSource[activeTab].length + 1}`, // Assuming this is an auto-incremented ID
      key: dataSource[activeTab].length + 1,
      date: values.date,
      status: values.status === "true" ? "Completed" : "Pending",
      amount: Number(values.amount),
      userName:
        users.find((user: any) => user._id === values.userId)?.name ||
        "Unknown", // Map userId to userName
    };
    setDataSource((prevState) => ({
      ...prevState,
      [activeTab]: [...prevState[activeTab], newRecord],
    }));
    message.success(
      `${
        activeTab === "withdrawals" ? "Withdrawal" : "Payment"
      } created successfully!`
    );
    onCloseDrawer();
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "Pending":
        return <Tag color="orange">Pending</Tag>;
      case "Completed":
        return <Tag color="green">Completed</Tag>;
      case "Cancelled":
        return <Tag color="red">Cancelled</Tag>;
      case "Processed":
        return <Tag color="blue">Processed</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<RecordType> = [
    {
      title: "Customer",
      dataIndex: "userName", // Updated to userName
      key: "userName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined onClick={() => showDrawer(record)} />
        </Space>
      ),
    },
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "withdrawals",
      label: "Withdrawals",
      children: (
        <>
          <div className="flex justify-between items-center">
            <h2>Withdrawal Management</h2>
            <Button
              type="primary"
              onClick={() => showDrawer()}
              style={{ marginBottom: "16px" }}
            >
              Create Withdrawal
            </Button>
          </div>
          <Card bordered={false}>
            <Table
              columns={columns}
              dataSource={dataSource.withdrawals}
              rowKey="id"
            />
          </Card>
        </>
      ),
    },
    {
      key: "payments",
      label: "Payments",
      children: (
        <>
          <div className="flex justify-between items-center">
            <h2>Payments Management</h2>
            <Button
              type="primary"
              onClick={() => showDrawer()}
              style={{ marginBottom: "16px" }}
            >
              Create Payment
            </Button>
          </div>
          <Card bordered={false}>
            <Table
              columns={columns}
              dataSource={dataSource.payments}
              rowKey="id"
            />
          </Card>
        </>
      ),
    },
  ];

  return (
    <div>
      <Wrapper>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "withdrawals" | "payments")}
          items={tabItems}
        />
      </Wrapper>

      {/* Drawer */}
      <Drawer
        title={`Create ${
          activeTab === "withdrawals" ? "Withdrawal" : "Payment"
        }`}
        width={400}
        visible={isDrawerVisible}
        onClose={onCloseDrawer}
        footer={null}
      >
        <Form
          form={form}
          initialValues={editingRecord || {}}
          onFinish={confirmAction}
          layout="vertical"
        >
          <Form.Item
            name="userId"
            label="User"
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              placeholder="Select a user"
              showSearch
              filterOption={(input, option: any) =>
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

          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              {
                required: true,
                message: `Please input the ${
                  activeTab === "withdrawals" ? "withdrawal" : "payment"
                } amount!`,
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[
              {
                required: true,
                message: `Please select the ${
                  activeTab === "withdrawals" ? "withdrawal" : "payment"
                } date!`,
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: `Please select the ${
                  activeTab === "withdrawals" ? "withdrawal" : "payment"
                } status!`,
              },
            ]}
          >
            <Select>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Processed">Processed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default CashOutPage;
