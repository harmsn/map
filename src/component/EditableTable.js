import React, { useContext, useState, useEffect, useRef} from 'react';
import 'antd/dist/antd.css';
import { Table, Input, Button, Popconfirm, Form} from 'antd';
const EditableContext = React.createContext();
var city="";
const USMap = (props) => {
  const { statesData } = props;
  console.log(props);
  return (
    <svg viewBox="0 0 960 600" height = {400} width = {400}>
      {statesData.map((stateData, index) =>
        <path
          className="someCSSClass"
          style={{cursor: "pointer",fill: "orange"}}
          key={index}
          stroke="#fff"
          strokeWidth="6px"
          d={stateData.shape}
          onMouseOver={(event) => {
            event.target.style.fill = 'red';
            console.log(stateData.name);
          }}
          
          onMouseOut={(event) => {
            event.target.style.fill = 'orange';
          }}
          onClick = {(event) => {
            city = stateData.name;
          }}
        >
        </path>
      )}
    </svg>
  )
}
const Editable = () => {
  const [statesData, setStatesData] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await fetch('https://willhaley.com/assets/united-states-map-react/states.json');
      const statesData = await res.json();
      setStatesData(statesData);
    })();
  }, []);
  if (!statesData) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <USMap  statesData={statesData} />
    </div>

  );
};
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async (e) => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};
class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'location',
        dataIndex: 'location',
      },
      {
        title: 'plan',
        dataIndex: 'plan',
        width: '30%',
      },
      {
        title: 'number of employees',
        dataIndex: 'number_of_employees',
        width: '30%',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];
    this.state = {

      dataSource: [
      ],
      count: 0,
    };
  }
  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };
  handleAdd = () => {
    if(city!==""){
      let count = this.state.count
      const newData = {
        key: count,
        number_of_employees: `12${count}`,
        plan: 'red',
        location : city
      };
      let dataSource = this.state.dataSource
      this.setState({
        dataSource: [...dataSource, newData],
        count: count + 1,
      });
      city =  "";
    }
  };
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <div  onClick={e => this.handleAdd()}>
          <Editable/>
        </div>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}

export default EditableTable;