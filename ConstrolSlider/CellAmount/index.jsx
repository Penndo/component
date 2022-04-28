import * as React from "react"
import styles from './index.module.less'
import TextInput from "../../Public/TextInput"
//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class CellAmount extends React.Component {

    render(){
        const {changeCols,changeRows,typeName,getValue,data} = this.props;
        return (
            <div>
                <p>{this.props.type}</p>
                <div className={styles["cellAmount"]}>
                    <TextInput defaultValue = {data.cols} label = "列数" typeName={typeName} propertyName="cols" readOnly={false}  getValue = {getValue} changeTableAmount={changeCols} />
                    <TextInput defaultValue = {data.rows} label = "行数" typeName={typeName} propertyName="rows" readOnly={false} getValue = {getValue} changeTableAmount={changeRows} />
                </div>
            </div>
        )
    }
}

export default CellAmount;