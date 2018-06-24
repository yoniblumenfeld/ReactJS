
class TimersDashboard extends React.Component {
    state = {
        timers: [],
    };
    componentDidMount() {
        this.loadTimersFromServer();
        setInterval(this.loadTimersFromServer, 5000);
    }

    loadTimersFromServer = () => {
        client.getTimers((serverTimers) => (
                this.setState({ timers: serverTimers })
            )
        );
    };
    deleteTimer = (timer_id) => {
        this.setState({timers:this.state.timers.filter(t => t.id !== timer_id)},);
        client.deleteTimer({id:timer_id});
    };

    handleCreateFormSubmit = (timer) => {
        this.createTimer(timer);
    };

    // Inside TimersDashboard
    handleEditFormSubmit = (attrs) => {
        this.updateTimer(attrs);
    };
    handleDeleteTimer = (timer_id) => {
        this.deleteTimer(timer_id);
    };
    handleStartClick = (timer_id) => {
        this.startTimer(timer_id);
    };
    handleStopClick = (timer_id) => {
        this.stopTimer(timer_id);
    };
    startTimer = (timer_id) => {
      const now = Date.now();
      this.setState({timers:this.state.timers.map((timer)=>{
          if(timer.id === timer_id){
              return Object.assign({},timer,{
                  runningSince:now,
              });
          }
          else{
              return timer;
          }
      })});
      client.startTimer({id:timer_id,start:now});
    };
    stopTimer = (timer_id) => {const now = Date.now();
      this.setState({timers:this.state.timers.map((timer)=>{
          if(timer.id === timer_id){
              const lastElapsed = now - timer.runningSince;
              return Object.assign({},timer,{
                  elapsed:timer.elapsed+lastElapsed,
                  runningSince:null,
              });
          }
          else{
              return timer;
      }

      })});
      client.stopTimer({id:timer_id,stop:now});
    };

    createTimer = (timer) => {
            const t = helpers.newTimer(timer);
            this.setState({
                timers: this.state.timers.concat(t),
            });
            client.createTimer(t);
        };

    updateTimer = (attrs) => {
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === attrs.id) {
                    return Object.assign({}, timer, {
                        title: attrs.title,
                        project: attrs.project,
                    });
                } else {
                    return timer;
                }
            }),
        });
        client.updateTimer(attrs);
    };

    render() {
        return (
            <div className='ui three column centered grid'>
                <div className='column'>
                    { /* Inside TimersDashboard.render() */}
                    <EditableTimerList
                        timers={this.state.timers}
                        onFormSubmit={this.handleEditFormSubmit}
                        onTimerDelete={this.handleDeleteTimer}
                        onStartClick={this.handleStartClick}
                        onStopClick={this.handleStopClick}
                    />
                    <ToggleableTimerForm
                        onFormSubmit={this.handleCreateFormSubmit}
                    />
                </div>
            </div>
        );
    }
}

class EditableTimerList extends React.Component{
    //Child of TimerDashboards, Parent of all EditableTimers

    render(){
        const timers = this.props.timers.map((timer)=>(
           <EditableTimer
           elapsed={timer.elapsed}
           title={timer.title}
           project={timer.project}
           runningSince={timer.runningSince}
           id={timer.id}
           key={timer.id}
           onFormSubmit={this.props.onFormSubmit}
           onTimerDelete={this.props.onTimerDelete}
           onStartClick={this.props.onStartClick}
           onStopClick={this.props.onStopClick}
           />));
        return(
            <div id="timers">
                {timers}
            </div>
        );
    }
}

class EditableTimer extends React.Component {
    state = {
        editFormOpen: false,
    };
    handleEditClick = () => {
        this.openForm();
    };
    handleFormClose = () => {
        this.closeForm();
    };
    handleSubmit = (timer) => {
        this.props.onFormSubmit(timer);
        this.closeForm();
    };
    closeForm = () => {
        this.setState({editFormOpen:false});
    };
    openForm = () => {
        this.setState({editFormOpen:true});
    };
    render() {
        if (this.state.editFormOpen) {
            return (
                <TimerForm
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    onFormSubmit={this.handleSubmit}
                    onFormClose={this.handleFormClose}
                />
            );
        } else {
            return (
                <Timer
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    elapsed={this.props.elapsed}
                    runningSince={this.props.runningSince}
                    onEditClick={this.handleEditClick}
                    onTimerDelete={this.props.onTimerDelete}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick}
                />
            );
        }
    }
}

class ToggleableTimerForm extends React.Component {
    //Child of TimersDashboard
    state = {
        isOpen: false,
    };
    handleFormOpen = () => {
        this.setState({isOpen: true});
    };
    handleFormClose = () => {
        this.setState({isOpen: false});
    };
    handleFormSubmit = (timer) => {
        this.props.onFormSubmit(timer);
        this.setState({isOpen:false});
    };
    render() {
        if (this.state.isOpen) {
            return (
                <TimerForm
                onFormSubmit={this.handleFormSubmit}
                onFormClose={this.handleFormClose}
                />
            );
        }
        else {
            return (
                <div className="ui basic content center aligned segment">
                    <button onClick={this.handleFormOpen} className="ui basic button icon">
                        <i className="plus icon"/>
                    </button>
                </div>
            );
        }
    }
}



class Timer extends React.Component {
    componentDidMount() {
        this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
    }

    componentWillUnmount() {
        clearInterval(this.forceUpdateInterval);
    }

    onTimerDelete = () => {
        this.props.onTimerDelete(this.props.id);
    };
    handleStartClick = () => {
      this.props.onStartClick(this.props.id);
    };
    handleStopClick = () => {
        this.props.onStopClick(this.props.id);
    };
    render() {
        const elapsedString = helpers.renderElapsedString(
            this.props.elapsed, this.props.runningSince
        );
        return (
            <div className='ui centered card'>
                <div className='content'>
                    <div className='header'>
                        {this.props.title}
                    </div>
                    <div className='meta'>
                        {this.props.project}
                    </div>
                    <div className='center aligned description'>
                        <h2>
                            {elapsedString}
                        </h2>
                    </div>
                    <div className='extra content'>
            <span onClick={this.props.onEditClick} className='right floated edit icon'>
              <i className='edit icon' />
            </span>
                        <span onClick={this.onTimerDelete} className='right floated trash icon' >
              <i className='trash icon' />
            </span>
                    </div>
                </div>
                <TimerActionButton
                    timerIsRunning={!!this.props.runningSince}
                    onStartClick={this.handleStartClick}
                    onStopClick={this.handleStopClick}
                />
            </div>
        );
    }

}


class TimerForm extends React.Component{
    //Child of EditableTimer and of ToggleableTimerForm
    state = {
      title: this.props.title || '',
      project: this.props.project || '',
    };
    handleTitleChange = (e) => {
        this.setState({title:e.target.value})
    };
    handleProjectChange = (e) => {
        this.setState({project:e.target.value})

    };
    handleSubmit = () =>{
        this.props.onFormSubmit({
           id:this.props.id,
           title: this.state.title,
            project:this.state.project,
        });
    };
    render(){
        const submitText = this.props.id ? 'Update':'Create';
        return (
            <div className="ui centered card">
                <div className="content">
                    <div className="ui form">
                        <div className="field">
                            <label>Title</label>
                            <input type="text"
                                   value={this.state.title}
                                   onChange={this.handleTitleChange}
                            />
                        </div>
                        <div className="field">
                            <label>Project</label>
                            <input type="text"
                                   value={this.state.project}
                                   onChange={this.handleProjectChange}
                            />
                        </div>
                        <div className="ui two bottom attached buttons">
                            <button onClick={this.handleSubmit} className="ui basic blue button">
                                {submitText}
                            </button>
                            <button onClick={this.props.onFormClose} className="ui basic red button">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class TimerActionButton extends React.Component {
    render() {
        if (this.props.timerIsRunning) {
            return (
                <div
                    className='ui bottom attached red basic button'
                    onClick={this.props.onStopClick}
                >
                    Stop
                </div>
            );
        } else {
            return (
                <div
                    className='ui bottom attached green basic button'
                    onClick={this.props.onStartClick}
                >
                    Start
                </div>
            );
        }
    }
}
ReactDOM.render(
    <TimersDashboard />,
    document.getElementById('content')
);
