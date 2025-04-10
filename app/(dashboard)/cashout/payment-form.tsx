"use client";

import { useCreateActivityLogMutation } from "@/services/activity-logs";
import { useGetUsersQuery } from "@/services/auth";
import { useCreateNotificationMutation } from "@/services/notifications";
import { useCreatePaymentMutation } from "@/services/payments";
import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Drawer, Form, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
const PaymentForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [createNotification] = useCreateNotificationMutation();
  const [createActivity] = useCreateActivityLogMutation();
  const { data, isFetching } = useGetUsersQuery(null);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedUser, setSelectedUser] = useState<any[]>([]);
  console.log(users);
  // Hnadle file category

  // Update user list when data is fetched
  useEffect(() => {
    setUsers(data?.allUsers || []);
  }, [data]);

  const handleFormSubmit = async (values: any) => {
    try {
      console.log(values);
      await createPayment(values).unwrap();
      await createActivity({
        activity: " Payment Entry",
        description: "A payment entry was made successfully",
        user: loggedInUser._id,
      }).unwrap();
      // Send notifications
      await createNotification({
        title: "Payment Information",
        message: "Payment has been made successfully",
        users: [values.user],
      });

      toast.success("Payment  created successfully");
      form.resetFields();
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating payment entry:", error);
      toast.error(error?.data?.message || "An error occurred");
    }
  };

  // Show drawer
  const showDrawer = () => setOpen(true);

  // Close drawer
  const onClose = () => setOpen(false);

  return (
    <>
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        New Payment
      </Button>
      <Drawer
        title="Create a New Payment"
        width={400}
        onClose={onClose}
        open={open}
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
          hideRequiredMark
        >
          <Form.Item
            name="user"
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
                message: `Please input the withdrawal amount!`,
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Request Date"
            name="requestedDate"
            rules={[
              {
                required: true,
                message: `Please select the withdrawal request date!`,
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Approval Date" name="approvedDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: `Please select the withdrawal status!`,
              },
            ]}
          >
            <Select>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Approved">Approved</Select.Option>
              <Select.Option value="Rejected">Rejected</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button loading={isLoading} type="primary" htmlType="submit" block>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default PaymentForm;
