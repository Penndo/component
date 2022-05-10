import * as React from "react"
import Options from "../Options"
import styles from './index.module.less'

class TextInput extends React.Component {

    state = {
        defaultValue:this.props.defaultValue,
        showOptions:false
    };

    //根据传入的输入类型限制，配置不同的正则
    getInputType = (type) => {
        let reg;
        switch (type) {
            case "number":
                reg = /[^\d]/;
                break;
            case "alphabet":
                reg = /[^\w]/;
                break;
            default:
                break;
        }
        return reg;
    }

    //在 react 中对 from 表单的修改都需要为 onChange 添加一个方法。
    onChange = (e) => {
        const reg = this.getInputType(this.props.inputType);
        const value = e.target.value.replace(reg,"");
        this.setState({
            defaultValue:value
        })
    }


    //属性更新后，更新状态
    componentDidUpdate(prevProps){
        if(this.props.defaultValue !== prevProps.defaultValue){
            this.setState({defaultValue:this.props.defaultValue})
        }
    }

    //输入框聚焦
    focus = () =>{
        this.setState({
            showOptions:true
        })
    }

    //输入框失焦后更新数据
    onBlur = (e) => {
        this.setState({
            showOptions:false
        })
        
        if(this.props.changeTableAmount){
            this.props.changeTableAmount(e.target.value)
        }

        if(this.props.getValue){
            this.props.getValue(this.props.typeName, this.props.propertyName, e.target.value)
        }
    }

    selectOption = (value)=>{
        console.log(value)
        this.setState({
            defaultValue:value
        })
    }

    render(){
        const {style, placeholder, hasPreInstall, label, labelDisplay, name, preInstallOptions,readOnly} = this.props;
        const {defaultValue,showOptions} = this.state;

        return (
            <div className={styles["textInput"]} style = {{...style}}>
                <input 
                    type="text" 
                    onChange={!readOnly ? this.onChange : this.nothingChanged} 
                    onFocus={this.focus}
                    onBlur={this.onBlur} 
                    name={name} 
                    value={defaultValue} 
                    placeholder={placeholder}
                    readOnly = {readOnly}
                />
                {hasPreInstall 
                    ? 
                    <div 
                        className={styles["preInstall"]}
                        style={{display:showOptions?"block":"none"}}>
                        <Options selectOption={this.selectOption} options={preInstallOptions}/>
                    </div>  
                    : 
                    null
                }
                {labelDisplay === "block" 
                    ? 
                    <label style={{display:labelDisplay}}>{label}</label>
                    : 
                    null
                }
                
            </div>
        )
    }
}

export default TextInput;