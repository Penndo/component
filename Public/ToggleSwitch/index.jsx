import * as React from "react"
import styles from './index.module.less'
//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class ToggleSwitch extends React.Component {

    state = {
        interLeaveChecked: this.props.interLeaveChecked,
    }

    componentDidUpdate(prevProps){
        if(this.props.interLeaveChecked !== prevProps.interLeaveChecked){
            this.setState({
                interLeaveChecked:this.props.interLeaveChecked
            })
        }
    }

    handleCheck = (event) => {
        this.props.handleSwitch(event.target.checked)
        this.setState({
            interLeaveChecked:event.target.checked
        })
    }

    render(){
        const {interLeaveChecked} = this.state
        return (
            <label className={styles["label"]}>
                <input type="checkbox" id="interLeave" onChange = {this.handleCheck} checked={interLeaveChecked}/>
                <div className={styles["switch"]}>
                    <div className={styles["dot"]}>
                    </div>
                </div>
                <span>{this.props.label}</span>
            </label>
        )
    }
}

export default ToggleSwitch;