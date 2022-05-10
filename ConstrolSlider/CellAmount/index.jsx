import * as React from "react"
import styles from './index.module.less'
import TextInput from "../../Public/TextInput"
//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class CellAmount extends React.Component {

    render(){
        const {changeTableAmout_cols,changeTableAmout_rows,typeName,getValue,data} = this.props;
        return (
            <div>
                <p>{this.props.type}</p>
                <div className={styles["cellAmount"]}>
                    <TextInput defaultValue = {data.cols} labelDisplay={"block"} label = "列数" typeName={typeName} propertyName="cols" readOnly={false}  getValue = {getValue} changeTableAmount={changeTableAmout_cols} />
                    <TextInput defaultValue = {data.rows} labelDisplay={"block"} label = "行数" typeName={typeName} propertyName="rows" readOnly={false} getValue = {getValue} changeTableAmount={changeTableAmout_rows} />
                </div>
            </div>
        )
    }
}

export default CellAmount;