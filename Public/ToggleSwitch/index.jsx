import * as React from "react"
import styles from './index.module.less'
//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class ToggleSwitch extends React.Component {

    state = {
        switchState: this.props.switchState,
    }

    componentDidUpdate(prevProps){
        if(this.props.switchState !== prevProps.switchState){
            this.setState({
                switchState:this.props.switchState
            })
        }
    }

    handleCheck = (event) => {
        this.props.handleSwitch(event.target.checked)
        this.setState({
            switchState:event.target.checked
        })
    }

    render(){
        const {switchState} = this.state
        return (
            <label className={styles["label"]}>
                <input type="checkbox" id="interLeave" onChange = {this.handleCheck} checked={switchState}/>
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