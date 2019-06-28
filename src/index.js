import React from "react";
import ReactDOM from "react-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import socketIOClient from "socket.io-client";
import "./styles.css";
const server = "https://primarylustrousdecompiler--moulalim.repl.co";
const socket = socketIOClient(
  "https://primarylustrousdecompiler--moulalim.repl.co/"
);
class Home extends React.Component {
  constructor(props) {
    super(props);

    // State object
    this.state = {
      loginform: "",
      auth: false,
      role: "Login",
      devicedata: [],
      showDevicesdata: "",
      notification: [],
      adddevice: (
        <form
          onSubmit={() => {
            this.addDevice(event);
          }}
        >
          deviceName:
          <input type="text" name="deviceName" />
          deviceId:
          <input type="text" name="deviceId" />
          <button>Add device</button>
        </form>
      )
    };

    // methods binding
    this.Login = this.Login.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.Logout = this.Logout.bind(this);
    this.showDevices = this.showDevices.bind(this);
    this.switchDevice = this.switchDevice.bind(this);
    this.restartDevice = this.restartDevice.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);
    this.addDevice = this.addDevice.bind(this);
  }
  // componentDidMount to create socket connection to server

  componentDidMount() {
    socket.on("connect", function() {
      console.log("Connected to Server");
    });
  }
  /*
    // message listener from server
    socket.on("newMessage", function(message) {
      console.log(message);
    });

   
    // // when disconnected from server
    // socket.on("disconnect", function() {
    //   console.log("Disconnect from server");
    // });
  }
*/
  // handleSubmit method to handle the login form data
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const body = {
      email: data.get("email"),
      password: data.get("password"),
      role: data.get("role")
    };

    // Http API request for authentication of user(client/admin)
    axios
      .post(server + "/auth", body)
      .then(res => {
        if (res.data.result === "success") {
          alert("login successfull");
          this.setState({ loginform: "", auth: true, role: body.role });
          this.fetchData();
        } else {
          alert("login failed");
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  // fetchData method to fetch the updated data from db
  fetchData() {
    axios
      .get(server + "/data")
      .then(res => {
        this.setState({ devicedata: res.data }, () => {
          this.showDevices();
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  // Add device method to mongodb
  addDevice(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const body = {
      deviceName: data.get("deviceName"),
      deviceId: data.get("deviceId"),
      deviceStatus: "OFF" // By default device will be in switch off mode till admin doesn't switch it ON.
    };
    console.log(body);
    axios
      .post(server + "/adddevice", body)
      .then(res => {
        alert("device added successfully");
        this.fetchData();
      })
      .catch(err => console.log(err));
  }

  // To switch the device ON and OFF
  switchDevice(id, newStatus, prevStatus) {
    if (newStatus === prevStatus) {
      if (newStatus === "ON") {
        alert("Device is already switched" + newStatus);
      } else if (newStatus === "OFF") {
        alert("Device is already switched" + newStatus);
      }
    } else {
      const notificationBody = {
        id: id,
        newStatus: newStatus
      };
      axios
        .put(server + "/switch/" + id + "/" + newStatus)
        .then(res => {
          // emits message from user side
          socket.emit("Notification", notificationBody);

          this.fetchData();
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  // Restart device method to change the status of device to restart
  restartDevice(id, prevStatus) {
    if (prevStatus === "Restarted") {
      alert("Device already restarted");
    } else
      axios
        .put(server + "/restartdevice/" + id)
        .then(res => {
          const notificationBody = {
            id: id,
            newStatus: prevStatus
          };
          // emits message from user side
          socket.emit("NotificationR", notificationBody);
          this.fetchData();
        })
        .catch(err => {
          console.log(err);
        });
  }

  // delete device from db
  deleteDevice(id) {
    axios
      .delete(server + "/deletedevice/" + id)
      .then(res => {
        alert("device deleted");
        this.fetchData();
      })
      .catch(err => console.log(err));
  }
  // Login Form element to be rendered if user clicks on login button
  Login() {
    const loginform = (
      <div id="Login">
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              maxLength="20"
              name="email"
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
            />
          </Form.Group>
          <Form.Group>
            <Form.Check type="radio" name="role" value="admin" label="Admin" />
            <Form.Check
              type="radio"
              name="role"
              value="client"
              label="client"
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </div>
    );
    this.setState({ loginform: loginform });
  }

  // Logout method to kill the session and hide the device data
  Logout() {
    alert("Logout successfull");
    this.setState({ auth: false, role: "Login" });
  }

  // showDevices to render the devices in different table format based on client and admin role
  showDevices() {
    // retrieve the array of objects from the devicedata state object
    if (this.state.role === "client") {
      var notifications = [];
      var devicesTableBody = this.state.devicedata.map((device, index) => {
        if (device.notification) {
          const ele = "***" + device.notification + "***";
          notifications.push(ele);
        }
        return (
          <tr key={index + 1}>
            <td>{index + 1}</td>
            <td>{device.deviceName}</td>
            <td>{device.deviceId}</td>
            <td>{device.deviceStatus}</td>
          </tr>
        );
      });
      // Table headers
      var deviceTableHeaders = (
        <tr>
          <th>S.NO</th>
          <th>deviceName</th>
          <th>deviceId</th>
          <th>deviceStatus</th>
        </tr>
      );
      // Table body
      var devicesTableRow = (
        <div>
          <table align="center">
            {deviceTableHeaders}
            {devicesTableBody}
          </table>
          <hr />
          -----Notifications-----
          <br />
          {notifications}
          <hr />
        </div>
      );
    } else {
      socket.on("Notifyclient", function(message) {
        alert(message.message);
      });
      // similiar to the above block but with more data and controls for admin role
      devicesTableBody = this.state.devicedata.map((device, index) => {
        return (
          <tr key={index + 1}>
            <td>{index + 1}</td>
            <td>{device.deviceName}</td>
            <td>{device.deviceId}</td>
            <td>{device.deviceStatus}</td>
            <td>
              <button
                onClick={() => {
                  this.switchDevice(device.deviceId, "ON", device.deviceStatus);
                }}
              >
                ON
              </button>
              <button
                onClick={() => {
                  this.switchDevice(
                    device.deviceId,
                    "OFF",
                    device.deviceStatus
                  );
                }}
              >
                OFF
              </button>
            </td>
            <td>
              <button
                onClick={() => {
                  this.restartDevice(device.deviceId, device.deviceStatus);
                }}
              >
                Restart
              </button>
            </td>
            <td>
              <button
                onClick={() => {
                  this.deleteDevice(device.deviceId);
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        );
      });
      deviceTableHeaders = (
        <tr>
          <th>S.NO</th>
          <th>deviceName</th>
          <th>deviceId</th>
          <th>deviceStatus</th>
          <th>ON/OFF</th>
          <th>Restart</th>
          <th>Delete</th>
        </tr>
      );

      devicesTableRow = (
        <div align="center">
          <table>
            {deviceTableHeaders}
            {devicesTableBody}
          </table>
          {this.state.adddevice}
        </div>
      );
    }
    this.setState({ showDevicesdata: devicesTableRow });
  }
  render() {
    return (
      <div className="Home">
        {!this.state.auth ? (
          <input type="button" value={this.state.role} onClick={this.Login} />
        ) : (
          <div>
            <input type="button" value={this.state.role} />
            <input type="button" value="Reload" onClick={this.fetchData} />
          </div>
        )}
        {this.state.auth ? (
          <input type="button" value="Logout" onClick={this.Logout} />
        ) : (
          <p />
        )}
        {this.state.auth ? <div>{this.state.showDevicesdata}</div> : <p />}
        {this.state.loginform}
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <h3>Openwifi devices</h3>
      <Home />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
