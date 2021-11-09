import * as React from "react"
import styles from './index.module.less'
import TextInput from "../../Public/TextInput"
//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class CellAmount extends React.Component {

    state = {
        data:this.props.data
    }

    getValue = (name,value) => {

        //获取状态中的数据
        const {data} = this.state;

        //设置新的数据
        const newData = {...data,[name]: value};

        //更新数据
        this.setState({
            data: newData
        })

        this.props.getControlData(this.props.name, newData)
    }

    componentDidUpdate(prevProps){
        if(this.props.data !== prevProps.data){
            this.setState({data:this.props.data})
        }
    }

    render(){
        const {cols,rows} = this.state.data
        return (
            <div>
                <p>{this.props.type}</p>
                <div className={styles["cellAmount"]}>
                    <TextInput defaultValue = {cols} label = "列数" name="cols" getValue = {this.getValue}/>
                    <TextInput defaultValue = {rows} label = "行数" name="rows" getValue = {this.getValue}/>
                </div>
            </div>
        )
    }
}

export default CellAmount;