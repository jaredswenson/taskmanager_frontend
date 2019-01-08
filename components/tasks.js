import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Modal, TouchableHighlight, Alert, Dimensions } from 'react-native';
import { Card, Input, Button, Divider, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import Carousel, { Pagination } from 'react-native-snap-carousel';

const sliderWidth = Dimensions.get('window').width;
const itemHeight = Dimensions.get('window').height;

export default class Tasks extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      create_new: false,
      create_new_child: false,
      name: '',
      due_date: '',
      parent_id: 0,
      time_estimate: 0,
      recurring: false,
      recurring_frequency: 0,
      parentTasks: [],
      childTasks: [],
      show_children: false,
      active_parent: 0,
      modalVisible: false,
      completed_task: {},
      listView: true,
      activeSlide: 1
    };

    this._renderItem = this._renderItem.bind(this);
  }

  componentDidMount(){
    var _this = this;
    _this._getTasks();
  }

  _getTasks = async () =>{
    var _this = this;
    var details = {
      'user_id': _this.props.current_user.id,
      'parent_id': 0,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://10.0.1.117.xip.io:3000/task/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'authorization': _this.props.token
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {
      _this.setState({childTasks: responseJson.childTasks});
      _this.setState({parentTasks: responseJson.parentTasks});
    })
  }

  _saveTask = async () => {
    var _this = this;
    var details = {
      'user_id': _this.props.current_user.id,
      'name': _this.state.name,
      'due_date': _this.state.due_date,
      'parent_id': _this.state.parent_id,
      'time_estimate': _this.state.time_estimate,
      'is_completed': false,
      'total_time': 0,
      'recurring': false,
      'recurring_frequency': 0,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://10.0.1.117.xip.io:3000/task/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'authorization': _this.props.token
      },
      body: formBody
    })
    .then((response) => {
      this.setState({create_new_child: false});
      this.setState({create_new: false});
      console.log(details)
      if(details.parent_id == 0){
        this.setState({parentTasks: this.state.parentTasks.concat([details])});
      }else{
        this.setState({childTasks: this.state.childTasks.concat([details])});
      }
    })
  }

  _completeTask = async (task) => {
    var _this = this;
    var details = {
      'task_id': task.id,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://10.0.1.117.xip.io:3000/task/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'authorization': _this.props.token
      },
      body: formBody
    })
    .then((response) => {
      if(task.parent_id == 0){
        this.state.parentTasks.map((parentTask, index) => {
          if(parentTask.id == task.id){
            this.state.parentTasks.splice(index, 1);
          }
        })
      } else{
        this.state.childTasks.map((childTask, index) => {
          if(childTask.id == task.id){
            this.state.childTasks.splice(index, 1);
          }
        })
      }
      if(this.state.modalVisible){
        this.setModalVisible(false, {})
      }
    })
  }

  setCreateParentTask(){
    this.setState({parent_id: 0})
    if(this.state.create_new){
      this.setState({create_new: false})
    }else{
      this.setState({create_new: true})
    }
  }

  setCreateChildTask(parent_id){
    this.setState({parent_id: parent_id});
    this.setState({active_parent: parent_id})
    this.setState({due_date: null});
    if(this.state.create_new_child){
      this.setState({create_new_child: false})
    }else{
      this.setState({create_new_child: true})
    }
  }

  logoutUser(){
    var _this = this;
    this.props.onLogoutUser();
  }

  setActiveParent(parent_id){
    this.setState({active_parent: -100})
    if(this.state.show_children){
      this.setState({show_children: false})
    }else{
      this.setState({show_children: true})
      this.setState({active_parent: parent_id})
    }
  }

  setModalVisible(visible, task) {
    this.setState({modalVisible: visible});
    this.setState({completed_task: task});
  }

  daysRemaining(date){
    var arr = date.split('/')
    var year = arr[2];
    var month = arr[0];
    var day = arr[1];
    var formattedDate = new Date(year + '/' + month + '/' + day).getTime();
    var today = Date.now();
    var timeDiff = Math.abs(today - formattedDate);
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays
  }

  _renderItem (task, i) {
    var _this = this;
    var task = task.item;
    var children = this.state.childTasks.map((taskAgain, k) => {
      return(
        taskAgain.parent_id == task.id && !taskAgain.isActive? 
          <View key={k} style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
            <View style={{width: 100, height: 50, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#d6d7da'}}>
              <Text style={{color: 'white'}}>Name</Text>
              <Text style={{color: 'white'}}>{taskAgain.name}</Text>
            </View>
            <View style={{width: 100, height: 50, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#d6d7da'}}>
              <Text style={{color: 'white'}}>Hours</Text>
              <Text style={{color: 'white'}}>{taskAgain.time_estimate}</Text>
            </View>
            <View style={{width: 100, height: 50, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#d6d7da'}}>
              <Icon name='check' color='#7CFC00' size={25} onPress={() => this.setModalVisible(true, taskAgain)}/>
            </View>
          </View>: null
      )
    })
      return (
          <View>
              <Card containerStyle={{backgroundColor: '#8c9184', padding: 0, borderRadius: 5, height: 650}} key={i}>
                <Header
                  placement="left"
                  leftComponent={
                    <Icon name='plus' color='#1ec0ff' size={30} onPress={() => this.setCreateChildTask(task.id)}/>
                  }
                  centerComponent={{ text: task.name, style: { fontWeight: 'bold', fontSize: 18, color: 'white'} }}
                  rightComponent={<Icon name='check' color='#7CFC00' size={30} onPress={() => this.setModalVisible(true, task)}/>}
                  containerStyle={{
                    backgroundColor: '#1a1a1a',
                    paddingTop: 0,
                    borderRadius: 5
                  }}
                />
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                  <View style={{width: 100, height: 50, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#d6d7da'}}>
                    <Text style={{color: 'white'}}>Total Hours</Text>
                    <Text style={{color: 'white'}}>{task.total_time}</Text>
                  </View>
                  <View style={{width: 100, height: 50, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#d6d7da'}}>
                    <Text style={{color: 'white'}}>Due in</Text>
                    {
                      this.daysRemaining(task.due_date) <= 14 ?
                      <Text style={{color: 'white'}}>{this.daysRemaining(task.due_date)} Days</Text> :
                      <Text style={{color: 'white'}}>{Math.round(this.daysRemaining(task.due_date)/7 * 100)/100} Weeks</Text>
                    }
                  </View>
                  <View style={{width: 100, height: 50, alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#d6d7da'}}>
                    {
                      this.daysRemaining(task.due_date) <= 14 ?
                        <Text style={{color: 'white'}}>{Math.round(task.total_time/this.daysRemaining(task.due_date) * 100) / 100} Hours/Day</Text>
                        :
                        <Text style={{color: 'white'}}>{Math.round(task.total_time/(this.daysRemaining(task.due_date)/7) * 100) / 100 } Hours/Week</Text>

                    }
                  </View>
                </View>
                {this.state.create_new_child && task.id == this.state.active_parent?
                    <View style={{marginTop:49, alignItems: 'center'}}>
                      <TextInput
                        placeholder='Name'
                        onChangeText={(name) => this.setState({name})}
                        style={{height: 40, width: 300, borderBottomColor: '#d6d7da', borderBottomWidth: 0.5, color: 'white'}}
                      />
                      <TextInput
                        placeholder='Estimated Hours'
                        onChangeText={(time_estimate) => this.setState({time_estimate})}
                        style={{height: 40, width: 300, borderBottomColor: '#d6d7da', borderBottomWidth: 0.5, color: 'white'}}
                      /> 
                      <Divider style={{ height: 20, backgroundColor: '#8c9184' }} />
                      <Button
                        title='Save'
                        buttonStyle={{
                        width: 300,
                        height: 45,
                        borderColor: "transparent",
                        borderWidth: 0,
                        borderRadius: 5
                      }}
                      onPress={() => this._saveTask()}/>
                      </View> : null
                    }
                    <View style={{alignItems: 'center', borderBottomWidth: 0.5, borderColor: 'black', marginTop: 70}}>
                      <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', padding: 5}}>Things to get done by: {task.due_date}</Text>
                    </View>
                    <ScrollView>
                      {children}
                    </ScrollView>
              </Card>
          </View>
        );
    }

  render() {
    return (
      <View>
        <Header
          leftComponent={
            !this.state.create_new ? 
            <Icon name='plus' color='#1ec0ff' size={30} onPress={() => this.setCreateParentTask()}/>:
            <Icon name='minus' color='#1ec0ff' size={30} onPress={() => this.setCreateParentTask()}/>
          }
          centerComponent={{ text: 'TaskManager', style: { fontWeight: 'bold', fontSize: 18, color: 'white'} }}
          rightComponent={<Icon name='logout' color='white' size={30} onPress={() => this.logoutUser()}/>}
          containerStyle={{
            backgroundColor: '#1a1a1a',
            justifyContent: 'space-around',
            marginTop:35,
            paddingTop: 0
          }}
        />
        {this.state.create_new ?
            <Card containerStyle={{backgroundColor: '#8c9184', marginTop: '5%'}}>
              <TextInput
                placeholder='Name'
                onChangeText={(name) => this.setState({name})}
                style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1}}
              />
              <TextInput
                placeholder='MM/DD/YYYY'
                onChangeText={(due_date) => this.setState({due_date})}
                style={{height: 40, borderBottomColor: 'white', borderBottomWidth: 1}}
              />
              <Divider style={{ height: 20, backgroundColor: '#8c9184' }} />
              <Button
                title='Save'
                buttonStyle={{
                width: 300,
                height: 45,
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 5
              }}
              onPress={() => this._saveTask()}

            />
            </Card>:null
        }
      <Carousel
        ref={(c) => { this._carousel = c; }}
        data={this.state.parentTasks}
        renderItem={this._renderItem}
        layout={'default'} 
        sliderWidth={sliderWidth}
        itemWidth={sliderWidth}
        itemHeight={itemHeight}
        loop={true}
        onSnapToItem={(index) => this.setState({ activeSlide: index }) }
      />
      <Pagination
        dotsLength={this.state.parentTasks.length}
        activeDotIndex={this.state.activeSlide}
      />

      <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          >
          <View style={{marginTop: 350, height:200}}>
            <View alignItems='center'>
              <Card>
                <Button
                icon={
                    <Icon
                      name='check'
                      size={15}
                      color='white'
                    />
                  }
                  title={this.state.completed_task.name}
                  buttonStyle={{
                  width: 300,
                  height: 45,
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 5,
                  backgroundColor: '#7CFC00'
                }}
                onPress={() => this._completeTask(this.state.completed_task)}

                />
                <Divider style={{ height: 20, backgroundColor: '#fff' }} />
                <Button
                icon={
                    <Icon
                      name='back'
                      size={15}
                      color='white'
                    />
                  }
                  title='Close'
                  buttonStyle={{
                  width: 300,
                  height: 45,
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 5,
                  backgroundColor: 'orange'
                }}
                onPress={() => this.setModalVisible(false, {})}
                />
              </Card>
            </View>
          </View>
        </Modal>
     </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8c9184',
    alignItems: 'center',
    justifyContent: 'center',
  }
});