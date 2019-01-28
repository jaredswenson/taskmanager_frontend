import React from 'react';
import { StyleSheet, Text, View, ScrollView, ImageBackground, StatusBar } from 'react-native';
import { Card, Button, Divider, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';

import Login from './components/login.js'
import CreateAccount from './components/create_account.js'
import Tasks from './components/tasks.js'


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      create_user: false,
      logged_in: false,
      current_user: {},
      create_new_parent: false
    };
  }

  setCreateUser(){
    if(this.state.create_user){
      this.setState({create_user: false})
    }else{
      this.setState({create_user: true})
    }
  }

  setUser = (user, token) => {
      this.setState({current_user: user});
      this.setState({token: token});
      this.setState({logged_in: true});
      this.setState({create_user: false});
  }

  _logoutUser = () => {
    this.setState({current_user: {}});
    this.setState({token: ''});
    this.setState({logged_in: false});
  }

  render() {
    return (
      <ImageBackground source={require("./assets/blue.jpg")} style={{width: null, height: null, flex: 1, resizeMode: 'center'}}>
      <StatusBar backgroundColor="#2b313a" barStyle="light-content" />
        <View styles={styles.container}>
        {
          !this.state.logged_in ?
          <Card containerStyle={{backgroundColor: 'rgba(0, 0, 0, 0)', marginTop: '25%', borderWidth: 0}} >
            <Text>Login to Donezo!</Text>
            {
              !this.state.create_user ?
                <Login onSetUser={this.setUser}/>
              :
                <CreateAccount onSetUser={this.setUser}/>
            }
              <Divider style={{ height: 20, backgroundColor: 'rgba(0, 0, 0, 0)' }} />
            {
              !this.state.create_user ?
              <Button
              title='Sign Up'
              buttonStyle={{
                backgroundColor: "#7CFC00",
                width: 300,
                height: 45,
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 5
              }}
              onPress={() => this.setCreateUser()}
            /> :
            <Button
              title='Already have an account?'
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
              onPress={() => this.setCreateUser()}
            />
            }     

          </Card>
          :
          <View>        
            <Tasks current_user={this.state.current_user} token={this.state.token} onLogoutUser={this._logoutUser}/>
          </View>
        }
         
        </View>
      </ImageBackground>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    // marginTop:25%,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
