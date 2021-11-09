import * as React from "react"
import styles from './index.module.less'

class TextInput extends React.Component {

    state = {
        defaultValue:this.props.defaultValue
    }

    //在 react 中对 from 表单的修改都需要为 onChange 添加一个方法。
    changeValue = (e) => {
        this.setState({
            defaultValue:e.target.value
        })
    }

    //属性更新后，更新 cols 的显示值
    componentDidUpdate(prevProps){
        if(this.props.defaultValue !== prevProps.defaultValue){
            this.setState({defaultValue:this.props.defaultValue})
        }
    }

    //输入框失焦后更新数据
    updateValue = (e) => {
        this.props.getValue(e.target.name, e.target.value)
    }

    render(){
        const {style, placeholder, label, labelDisplay, name} = this.props;
        const {defaultValue} = this.state;

        return (
            <div className={styles["textInput"]} style = {{...style}}>
                <input type="text" onChange={this.changeValue} onBlur={this.updateValue} name={name} value={defaultValue} placeholder={placeholder}/>
                <label style={{display:labelDisplay}}>{label}</label>
            </div>
        )
    }
}

export default TextInput;

TextInput.defaultProps = {
    label:"标签名",
    labelDisplay:"block",
    placeholder:"请输入",
    defaultValue:""
}