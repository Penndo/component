import * as React from "react"
import ColorPicker from "../ColorPicker"
import ToggleSwitch from "../ToggleSwitch"
import styles from "./index.module.less"

class ColorSwitch extends React.Component {
    //通过 ToggleSwitch 控制颜色的传递
    state = {
        isDisplay:this.props.interLeaveChecked,
        intervalDefaultColor:this.props.historyColor,
        keyValue:1
    }

    componentDidUpdate(prevProps){
        if(this.props.interLeaveChecked !== prevProps.interLeaveChecked){
            this.setState({
                isDisplay:this.props.interLeaveChecked
            })
        }        
        if(this.props.historyColor !== prevProps.historyColor){
            this.setState({
                intervalDefaultColor:this.props.historyColor
            })
        }
    }

    handleSwitch = (switchState) => { 
        //开关打开时，将 historyColor 传到 intervalColor 中；开关关闭时，将 “空” 传到 intervalColor 中
        this.props.getValue("intervalColor", switchState ? this.props.historyColor : "",{"interLeaveChecked":switchState});
        this.setState({
            isDisplay: switchState ? true : false,
            intervalDefaultColor: this.props.historyColor,
        })  

        //用来控制 keyValue 的值，进而控制 colorPicker 是否更新，switch 每次打开时，keyValue + 1，生成一个新的colorPicker。
        //详情可看 react 官网文档 《你可能不需要使用派生 state》
        if(switchState){
            this.setState({
                keyValue:this.state.keyValue + 1,
            })
        }     
        //给父组件一个 switchState 状态的一个反馈
        this.props.getSwitchState(switchState)
    }
    
    render(){
        const {toggleLabel, switchColorPicker, interLeaveChecked, getValue, name} = this.props;
        const {isDisplay, intervalDefaultColor} = this.state;

        return (
            <div className={styles["switchGroup"]}>
            
                <ToggleSwitch label={toggleLabel} handleSwitch = {this.handleSwitch} interLeaveChecked={interLeaveChecked}/>

                {/*包裹层的 div 用来控制 colorpicker 是否可用*/}
                {
                    switchColorPicker && isDisplay ?
                    <ColorPicker key={this.state.keyValue} style={{ width: 24, height: 24, marginLeft: 8}} defaultColor={intervalDefaultColor} name={name} getValue={getValue} /> :
                    null
                }
            </div>
        )
    }
}

export default ColorSwitch;