import * as React from "react"
import styles from './index.module.less'
//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class ToggleSwitch extends React.Component {

    state = {
        interLeaveChecked: false,
    }

    handleCheck = () => {
        this.props.handleSwitch(!this.state.interLeaveChecked)
        this.setState({
            interLeaveChecked:!this.state.interLeaveChecked
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