import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Modal, TouchableHighlight, Alert, Dimensions, FlatList } from 'react-native';
import {Haptic} from 'expo';
import { Card, Input, Button, Divider, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import DatePicker from 'react-native-datepicker'

const sliderWidth = Dimensions.get('window').width;
// const itemHeight = Dimensions.get('window').height;
const itemHeight = 300;

export default class Tasks extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      create_new: false,
      create_new_child: false,
      name: '',
      due_date: '',
      month: '',
      date: '',
      year: '',
      parent_id: 0,
      time_estimate: 0,
      recurring: false,
      recurring_frequency: 0,
      parentTasks: [],
      childTasks: [],
      show_children: false,
      active_parent: 0,
      modalVisible: false,
      current_task: {},
      listView: true,
      creating_task: false,
      show_carousel: true,
      slideIndex: 0,
      todays_date: '',
      noTasks: false,
      taskPicker: true,

    };
    this._renderItem = this._renderItem.bind(this);
  }

  componentDidMount(){
    var _this = this;
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!
    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }
    var today = yyyy + '-' + mm + '-' + dd;
    _this.setState({todays_date: today});
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
      console.log(responseJson.parentTasks)
      if(responseJson.parentTasks.length <= 0){
        _this.setState({noTasks: true});
        _this.setModalVisible(true, {}, true, false);
      }
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
      'time_estimate': Number(_this.state.time_estimate),
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
      this.setState({show_carousel: false})
      this.setState({create_new_child: false});
      this.setState({create_new: false});
      if(details.parent_id == 0){
        this.setState({parentTasks: this.state.parentTasks.concat([details])});
        this.setState({slideIndex: this.state.parentTasks.length - 1})
      }else{
        this.setState({childTasks: this.state.childTasks.concat([details])});
        ///// reconfigure times & math
        var totalTime = 0;
        this.state.childTasks.map((childTask, index) => {
          if(childTask.parent_id == details.parent_id){
            totalTime = totalTime + childTask.time_estimate
          }
        });
        this.state.parentTasks.map((parentTask, index) => {
          if(parentTask.id == details.parent_id){
            parentTask.total_time = totalTime;
          }
        });
        this.setState({parentTasks: this.state.parentTasks});
      }
      if(this.state.modalVisible){
        this.setModalVisible(false, {}, false);
      }
      this.setState({show_carousel: true})
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
            if(this.state.parentTasks.length <= 0){
              _this.setState({noTasks: true});
              _this.setModalVisible(true, {}, true, false);
            }else{
              if(this.state.modalVisible){
                this.setModalVisible(false, {})
              }
            }
          }
        })
      } else{
        var currentParent = 0;
        this.state.childTasks.map((childTask, index) => {
          if(childTask.id == task.id){
            currentParent = childTask.parent_id;
            this.state.childTasks.splice(index, 1);
            if(this.state.modalVisible){
              this.setModalVisible(false, {})
            }
          }
        });
        ///// reconfigure times & math
        var totalTime = 0;
        this.state.childTasks.map((childTask, index) => {
          if(childTask.parent_id == currentParent){
            totalTime = totalTime + childTask.time_estimate
          }
        });
        this.state.parentTasks.map((parentTask, index) => {
          if(parentTask.id == currentParent){
            parentTask.total_time = totalTime;
          }
        });
        this.setState({parentTasks: this.state.parentTasks});
      }

    })
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

  setModalVisible(visible, task, creating_task, is_child) {
    this.setState({current_task: task});
    this.setState({modalVisible: visible});
    this.setState({creating_task: creating_task});
    if(is_child){
      this.setState({parent_id: task.id});
    }else{
      this.setState({parent_id: 0});
    }
  }

  daysRemaining(date){
    var arr = date.split('-')
    var year = arr[0];
    var month = arr[1];
    var day = arr[2];
    var formattedDate = new Date(year + '/' + month + '/' + day).getTime();
    var today = Date.now();
    var timeDiff = Math.abs(today - formattedDate);
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays
  }

  displayDate(date){
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var arr = date.split('-')
    var year = arr[0];
    var month = parseInt(arr[1]) - 1;
    var day = arr[2];
    var displayDate = monthNames[month] + ' ' + day + ', ' + year;
    return displayDate
  }

  snapEvent(index){
    Haptic.notification();
    this.setState({ slideIndex: index });
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
              <Icon name='check' color='#7CFC00' size={25} onPress={() => this.setModalVisible(true, taskAgain, false, true)}/>
            </View>
          </View>: null
      )
    })
    var lengthArray = [];
    this.state.childTasks.map((taskAgain, k) => {
      taskAgain.parent_id == task.id ? lengthArray.push(taskAgain):null;
    })
      return (
          <View>
              <Card containerStyle={{backgroundColor: '#8c9184', padding: 0, borderRadius: 5}} key={i}>
                <Header
                  leftComponent={
                    <Icon name='plus' color='#1ec0ff' size={30} onPress={() => this.setModalVisible(true, task, true, true)}/>
                  }
                  centerComponent={{ text: task.name, style: { fontWeight: 'bold', fontSize: 18, color: 'white'} }}
                  rightComponent={<Icon name='check' color='#7CFC00' size={30} onPress={() => this.setModalVisible(true, task, false, true)}/>}
                  containerStyle={{
                    backgroundColor: '#2b313a',
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
                    <View style={{alignItems: 'center', borderBottomWidth: 0.5, borderColor: 'black', marginTop: 70}}>
                      <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', padding: 5}}>{this.displayDate(task.due_date)}</Text>
                    </View>
                    <ScrollView style={{height:375}}>
                      {
                        lengthArray.length >= 1 ?
                        children:
                        <View style={{alignItems: 'center'}}>
                          <Button
                            raised
                            icon={{name: 'add', color: 'white'}}
                            title='Add A Task!' 
                            onPress={() => this.setModalVisible(true, task, true, true)}
                            style={{marginTop: 10}}
                            />
                        </View>
                      }
                    </ScrollView>
                
              </Card>
          </View>
        );
    }

    get pagination () {
        return (
            <Pagination
              dotsLength={this.state.parentTasks.length}
              activeDotIndex={this.state.slideIndex}
              containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)'}}
              dotStyle={{
                  width: 5,
                  height: 5,
                  borderRadius: 5,
                  // marginHorizontal: 1,
                  backgroundColor: 'white'
              }}
              inactiveDotStyle={{
                  // Define styles for inactive dots here
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
        );
    }

  render() {
    return (
      <View>
        <Header
          leftComponent={<Icon name='plus' color='#1ec0ff' size={30} onPress={() => this.setModalVisible(true, {}, true, false)}/>}
          centerComponent={{ text: 'Donezo!', style: { fontWeight: 'bold', fontSize: 18, color: 'white'} }}
          rightComponent={<Icon name='logout' color='white' size={30} onPress={() => this.logoutUser()}/>}
          containerStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0)',
            justifyContent: 'space-around',
            marginTop:0,
            paddingTop: 20,
            borderBottomWidth:0
          }}
        />
        {
          this.state.show_carousel ?
            <View>
              { this.pagination }
              <Carousel
                ref={(c) => { this._carousel = c; }}
                firstItem={this.state.slideIndex}
                data={this.state.parentTasks}
                renderItem={this._renderItem}
                layout={'default'} 
                sliderWidth={sliderWidth}
                itemWidth={sliderWidth}
                itemHeight={itemHeight}
                onSnapToItem={(index) => this.snapEvent(index) }
              />
            </View>
          :null
        }


      <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          >
          <View style={{marginTop: 150, height:200}}>
            {
              !this.state.creating_task ?
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
                  title={this.state.current_task.name}
                  buttonStyle={{
                  width: 300,
                  height: 45,
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 5,
                  backgroundColor: '#7CFC00'
                }}
                onPress={() => this._completeTask(this.state.current_task)}

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
                  onPress={() => this.setModalVisible(false, {}, false)}
                />
              </Card>
            </View>:
            <View alignItems='center'>
              <Card>
                <View style={{alignItems: 'center'}}>
                  {
                    this.state.parent_id == 0 ?
                      this.state.noTasks ?
                      <View>
                        <Text>Welcome to Donezo!</Text>
                        <Text>What is your next big event?</Text>
                      </View>
                      :
                      <Text>New Task</Text>
                    : 
                      <Text>New Task for {this.state.current_task.name}</Text>

                  }
                  {
                    this.state.parent_id == 0 ?
                    <Card containerStyle={{backgroundColor: '#fff', marginTop: '5%'}}>
                      <TextInput
                        placeholder='Name'
                        onChangeText={(name) => this.setState({name})}
                        style={{height: 40, borderBottomColor: '#8c9184', borderBottomWidth: 1}}
                      />                      
                      <DatePicker
                        style={{width: 300, marginTop:10, marginBottom:10}}
                        date={this.state.due_date}
                        mode="date"
                        placeholder="select date"
                        format="YYYY-MM-DD"
                        minDate= "2019-01-16"
                        maxDate="2050-12-31"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        customStyles={{
                          dateIcon: {
                            display: 'none'
                          },
                          dateInput: {
                            marginTop: 10,
                            marginBottom: 10
                          }
                          // ... You can check the source to find the other keys.
                        }}
                        onDateChange={(date) => {this.setState({due_date: date})}}
                      />
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
                      <Divider style={{ height: 20, backgroundColor: '#fff' }} />
                      <Button
                        icon={
                            <Icon
                              name='back'
                              size={15}
                              color='white'
                            />
                          }
                          title='Cancel'
                          buttonStyle={{
                          width: 300,
                          height: 45,
                          borderColor: "transparent",
                          borderWidth: 0,
                          borderRadius: 5,
                          backgroundColor: 'orange'
                        }}
                        onPress={() => this.setModalVisible(false, {}, false)}
                      />
                    </Card>
                    :
                    <Card>
                      <TextInput
                        placeholder='Name'
                        onChangeText={(name) => this.setState({name})}
                        style={{height: 40, width: 300, borderBottomColor: 'white', borderBottomWidth: 0.5, color: 'black'}}
                      />
                      <TextInput
                        placeholder='Estimated Hours'
                        keyboardType = 'numeric'
                        onChangeText={(time_estimate) => this.setState({time_estimate})}
                        style={{height: 40, width: 300, borderBottomColor: 'white', borderBottomWidth: 0.5, color: 'black'}}
                      /> 
                      <Divider style={{ height: 20, backgroundColor: '#fff' }} />
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
                      <Divider style={{ height: 20, backgroundColor: '#fff' }} />
                      <Button
                        icon={
                            <Icon
                              name='back'
                              size={15}
                              color='white'
                            />
                          }
                          title='Cancel'
                          buttonStyle={{
                          width: 300,
                          height: 45,
                          borderColor: "transparent",
                          borderWidth: 0,
                          borderRadius: 5,
                          backgroundColor: 'orange'
                        }}
                        onPress={() => this.setModalVisible(false, {}, false)}
                      />
                    </Card>
                  }

                </View>
              </Card>
            </View>
            }
            
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