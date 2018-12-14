import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Card, Input, Button, Divider } from 'react-native-elements';

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
      tasks: []
    };
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
    fetch('http://localhost:3000/task/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'authorization': _this.props.token
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {
      _this.setState({tasks: responseJson.tasks});
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
    fetch('http://localhost:3000/task/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'authorization': _this.props.token
      },
      body: formBody
    })
    .then((response) => {
      this.setState({create_new_child: false})
      this.setState({create_new: false})
      _this._getTasks();

    })
  }

  _completeTask = async (task_id) => {
    var _this = this;
    var details = {
      'task_id': task_id,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch('http://localhost:3000/task/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'authorization': _this.props.token
      },
      body: formBody
    })
    .then((response) => {
      _this._getTasks();

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
    this.setState({due_date: null});
    if(this.state.create_new_child){
      this.setState({create_new_child: false})
    }else{
      this.setState({create_new_child: true})
    }
  }

  render() {
    return (
      <View styles={styles.container}>
        <Card containerStyle={{backgroundColor: '#fff', marginTop: '25%'}} >
          <Text>Tasks for {this.props.current_user.name}!</Text>
          <Button
          title='New Parent Task'
          buttonStyle={{
              width: 300,
              height: 45,
              borderColor: "transparent",
              borderWidth: 0,
              borderRadius: 5
            }}
            onPress={() => this.setCreateParentTask()}

        />
        {this.state.create_new ?
          <Card containerStyle={{backgroundColor: '#fff', marginTop: '5%'}}>
            <Input
              placeholder='Name'
              onChangeText={(name) => this.setState({name})}
            />
            <Input
              placeholder='Due Date'
              onChangeText={(due_date) => this.setState({due_date})}
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
            onPress={() => this._saveTask()}

          />
          </Card>:null
        }
        </Card>
        { this.state.tasks ?
            this.state.tasks.map((task, i) => {
              return task.parent_id == 0 && !task.is_completed ? 
                  <Card containerStyle={{backgroundColor: '#fff'}} key={i}>
                    <Text>{task.name}</Text>
                    <Text>Total Hours: {task.total_time}</Text>
                    <Text>Due in: {task.days_remaining} days</Text>
                    {
                      task.days_remaining <= 14 ?
                        <Text>{task.total_time/task.days_remaining} Hours Per Day</Text>
                        :
                        <Text>{Math.round(task.total_time/(task.days_remaining/7) * 100) / 100 } Hours Per Week</Text>

                    }
                    <Button
                      title='New Child Task'
                      buttonStyle={{
                          width: 300,
                          height: 45,
                          borderColor: "transparent",
                          borderWidth: 0,
                          borderRadius: 5
                        }}
                        onPress={() => this.setCreateChildTask(task.id)}

                    />
                     <Button
                          title='Complete Task'
                          buttonStyle={{
                              width: 300,
                              height: 45,
                              borderColor: "transparent",
                              borderWidth: 0,
                              borderRadius: 5
                            }}
                            onPress={() => this._completeTask(task.id)}

                        />
                    {this.state.create_new_child ?
                      <View>
                        <Input
                          placeholder='Name'
                          onChangeText={(name) => this.setState({name})}
                        />
                        <Input
                          placeholder='Estimated Hours'
                          onChangeText={(time_estimate) => this.setState({time_estimate})}
                        /> 
                        <Button
                          title='Save Task'
                          buttonStyle={{
                              width: 300,
                              height: 45,
                              borderColor: "transparent",
                              borderWidth: 0,
                              borderRadius: 5
                            }}
                            onPress={() => this._saveTask()}

                        />
                        </View> : null
                    }
                    {this.state.tasks.map((taskAgain, k) => {
                      return taskAgain.parent_id == task.id && !taskAgain.is_completed ? 
                      <View key={k}>
                          <Text>{taskAgain.name}</Text>
                          <Text>Estimated Hours: {taskAgain.time_estimate}</Text>
                          <Button
                          title='Complete Task'
                          buttonStyle={{
                              width: 300,
                              height: 45,
                              borderColor: "transparent",
                              borderWidth: 0,
                              borderRadius: 5
                            }}
                            onPress={() => this._completeTask(taskAgain.id)}

                        />
                        </View>
                        : null
                    })}
                  </Card>
              : null
          }):
        <Text>No Tasks</Text>

      }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});