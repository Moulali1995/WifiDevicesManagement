import React from "react";
import ReactDOM from "react-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import "./styles.css";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loginform: "", auth: false, role: "Login" };
    this.Login = this.Login.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.Logout = this.Logout.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const body = {
      email: data.get("email"),
      password: data.get("password"),
      role: data.get("role")
    };
    // debug form data
    console.log(body);
    // Http request for authentication of user
    axios
      .post("https://PrimaryLustrousDecompiler--moulalim.repl.co/auth", body)
      .then(res => {
        if (res.data.result === "success") {
          alert("login successfull");
          this.setState({ loginform: "", auth: true, role: body.role });
        } else {
          alert("login failed");
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
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
  Logout() {
    alert("Logout successfull");
    this.setState({ auth: false, role: "Login" });
  }
  render() {
    return (
      <div className="Home">
        <input type="button" value={this.state.role} onClick={this.Login} />
        {this.state.auth ? (
          <input type="button" value="Logout" onClick={this.Logout} />
        ) : (
          <p />
        )}
        {this.state.loginform}
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <h3>Login</h3>
      <Home />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
