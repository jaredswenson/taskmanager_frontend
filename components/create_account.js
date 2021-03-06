import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Input, Button, Divider } from 'react-native-elements';

export default class CreateAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      name: '',
      email: '',
      password: '',
      confirmPassword: '' 
    };
  }

  _createUser = async () => {
    var _this = this
    var details = {
      'name': _this.state.name,
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

    fetch('https://swensondonezo.herokuapp.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    })
    .then((response) => {
      console.log(response)
      response.json()}
      )
    .then((responseJson) => {
      _this._loginUser();
    });
  }

  _loginUser = async () => {
    var _this = this
    var details = {
      'email': _this.state.email,
      'password': _this.state.password,
      'is_premium': false
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch('https://swensondonezo.herokuapp.com/auth/login', {
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
    });
  }

  setUser(){
    var _this = this;
    this.props.onSetUser(_this.state.user, _this.state.token);
  }

  render() {
    return (
      <View >
        <TextInput
          placeholder='Name'
          autoCapitalize='none'
          placeholderTextColor='#fff'
          style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1, color: '#fff'}}
          onChangeText={(name) => this.setState({name})}
        />
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
          this.state.password != this.state.confirmPassword ?
          <Button
          title="Passwords Don't match"
          buttonStyle={{
              width: 300,
              height: 45,
              borderColor: "#000",
              borderWidth: 0,
              borderRadius: 5,
              backgroundColor: 'gray'
            }}

          /> :
          <Button
            title='Sign up'
            buttonStyle={{
                width: 300,
                height: 45,
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 5,
                backgroundColor: '#1ec0ff'

              }}
              onPress={() => this._createUser()}

          />
        }

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