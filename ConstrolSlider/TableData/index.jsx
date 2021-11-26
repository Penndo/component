import * as React from "react"
import TextInput from "../../Public/TextInput";
import styles from "./index.module.less"

//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class TableData extends React.Component {

    state = {
        data:this.props.data
    }

    getValue = (name,value) => {

        //获取状态中的数据
        const {data} = this.state;

        //补充进来新的数据
        const newData = {...data,[name]: value};

        //更新数据
        this.setState({
            data: newData
        })
        
        this.props.getControlData(this.props.name, newData)
    }

    render(){
        const {style, type} = this.props

        return(
            <div>
                <p>{type}</p>
                <div style = {{...style}} className={styles["fontStyle"]}>
                    <TextInput style={{width:"100%"}} defaultValue="https://randomuser.me/api/?results=5&inc=" name="api" label = "API" placeholder="请输入 API" canInput={true} getValue={this.getValue} />
                    <TextInput style={{width:"100%"}} defaultValue="gender,email,nat,phone" name="parameter" label = "参数" placeholder="请输入参数" canInput={true} getValue={this.getValue}  />
                </div>
            </div>
        )
    }
}

export default TableData;