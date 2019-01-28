import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Input, Button, Divider } from 'react-native-elements';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      email: '',
      password: '',
      confirmPassword: '',
      user: {},
      token: '',
      forgotPassword: false,
      passwordFields: false,
      codeSent: false,
      sentCode: '',
      code: ''
    };
  }

  _loginUser = async () => {
    var _this = this
    var details = {
      'email': _this.state.email,
      'password': _this.state.password
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://10.0.1.117.xip.io:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {
      _this.setState({user: responseJson.user[0]});
      _this.setState({token: responseJson.access_token});
      _this.setUser();
    })
    .catch(function(error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
       // ADD THIS THROW error
        throw error;
      });
  }

  _getUserByEmail = async () => {
    var _this = this
    var details = {
      'email': _this.state.email,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://10.0.1.117.xip.io:3000/auth/getuserbyemail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.code)
      _this.setState({sentCode: responseJson.code});
      _this.setState({codeSent: true});

    })
    .catch(function(error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
       // ADD THIS THROW error
        throw error;
      });
  }

  _resetPassword = async () => {
    var _this = this
    var details = {
      'email': _this.state.email,
      'password': _this.state.password
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://10.0.1.117.xip.io:3000/auth/resetpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {
      _this._loginUser();

    })
    .catch(function(error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
       // ADD THIS THROW error
        throw error;
      });
  }

  setUser(){
    var _this = this;
    this.props.onSetUser(_this.state.user, _this.state.token);
  }

  setForgotPassword(){
      this.setState({forgotPassword: !this.state.forgotPassword});
  }

  setNewPasswordFields(){
      this.setState({passwordFields: !this.state.passwordFields});
  }

  setCode(){
    if (this.state.code == this.state.sentCode) {
      this.setState({resetPassword: true});
    }else{
      this.setState({resetPassword: false});

    }
  }

  render() {
    return (
      <View>
      { !this.state.forgotPassword ?
        <View>
          <TextInput
            placeholder='Email'
            autoCapitalize='none'
            placeholderTextColor='#fff'
            style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
            onChangeText={(email) => this.setState({email})}
          />
          <TextInput
            placeholder='Password'
            autoCapitalize='none'
            placeholderTextColor='#fff'
            secureTextEntry={true}
            style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
            onChangeText={(password) => this.setState({password})}
          />
          <Divider style={{ height: 20, backgroundColor: 'rgba(52, 52, 52, 0.1)' }} />
          <Button
            title='Log in'
            raised
            buttonStyle={{
                width: 300,
                height: 45,
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 5,
                backgroundColor: '#1ec0ff'
              }}
              onPress={() => this._loginUser()}

          />
          <Button
            title='Forgot Password?'
            color='#fff'
            raised
            buttonStyle={{
              backgroundColor: "transparent",
              width: 300,
              height: 45,
              borderColor: "transparent",
              borderWidth: 1,
              borderRadius: 5,
            }}
            onPress={() => this.setForgotPassword()}
          />
        </View>:
        <View>
        {
          !this.state.codeSent?
          <View>
            <TextInput
              placeholder='Email'
              autoCapitalize='none'
              placeholderTextColor='#fff'
              style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
              onChangeText={(email) => this.setState({email})}
            />
            <Divider style={{ height: 20, backgroundColor: 'rgba(52, 52, 52, 0.1)' }} />
            <Button
              title='Send Email'
              raised
              buttonStyle={{
                  width: 300,
                  height: 45,
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 5,
                  backgroundColor: '#1ec0ff'
                }}
                onPress={() => this._getUserByEmail()}

            />
            <Button
              title='Remember Password?'
              color='#fff'
              raised
              buttonStyle={{
                backgroundColor: "transparent",
                width: 300,
                height: 45,
                borderColor: "transparent",
                borderWidth: 1,
                borderRadius: 5,
              }}
              onPress={() => this.setForgotPassword()}
            />
          </View>:
          <View>
            { !this.state.passwordFields ?
              <View>
                <TextInput
                  placeholder='Enter Code'
                  autoCapitalize='none'
                  keyboardType = 'numeric'
                  placeholderTextColor='#fff'
                  style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
                  onChangeText={(code) => this.setState({code})}
                />
                <Divider style={{ height: 20, backgroundColor: 'rgba(52, 52, 52, 0.1)' }} />
              </View>:null
            }
            
            {
              this.state.sentCode == this.state.code && !this.state.passwordFields?
              <Button
                title='Reset Password'
                raised
                buttonStyle={{
                    width: 300,
                    height: 45,
                    borderColor: "transparent",
                    borderWidth: 0,
                    borderRadius: 5,
                    backgroundColor: '#1ec0ff'
                  }}
                  onPress={() => this.setNewPasswordFields()}

              />:null
            }
          </View>
        }
        </View>
      }
      <View>
        {
          this.state.passwordFields ? 
          <View>
            <TextInput
              placeholder='Password'
              autoCapitalize='none'
              placeholderTextColor='#fff'
              secureTextEntry={true}
              style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
              onChangeText={(password) => this.setState({password})}
            />
            <TextInput
              placeholder='Confirm Password'
              autoCapitalize='none'
              placeholderTextColor='#fff'
              secureTextEntry={true}
              style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
              onChangeText={(confirmPassword) => this.setState({confirmPassword})}
            />
            <Divider style={{ height: 20, backgroundColor: 'rgba(52, 52, 52, 0.1)' }} />
            {
              this.state.password == this.state.confirmPassword && this.state.password.length >= 1?
              <Button
                title='Save Password'
                raised
                buttonStyle={{
                    width: 300,
                    height: 45,
                    borderColor: "transparent",
                    borderWidth: 0,
                    borderRadius: 5,
                    backgroundColor: '#1ec0ff'
                  }}
                  onPress={() => this._resetPassword()}

              />: null
            }
            
          </View>:null
        }
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // }
});