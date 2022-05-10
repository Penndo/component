import * as React from "react"
import styles from './index.module.less'
import TextInput from "../../Public/TextInput"

class CellPaddingSetting extends React.Component {

    render(){
        const {type, area, data, typeName, getValue} = this.props;
        return (
            <div>
                <p>{type}</p>
                {
                    typeName === "tbodyPadding"
                    ? 
                    <div className={styles["cellPadding"]+" "+styles["bodyPadding"]}>
                        <TextInput labelDisplay={"block"} defaultValue = {data[area+"_top"]} typeName = {typeName} propertyName={area+"_top"} label = "top" readOnly={false} getValue={getValue}/>
                        <TextInput labelDisplay={"block"} defaultValue = {data[area+"_right"]} typeName = {typeName} propertyName={area+"_right"} label = "right" readOnly={false} getValue={getValue}/> 
                        <TextInput labelDisplay={"block"} defaultValue = {data[area+"_bottom"]} typeName = {typeName} propertyName={area+"_bottom"} label = "bottom" readOnly={false} getValue={getValue}/>
                        <TextInput labelDisplay={"block"} defaultValue = {data[area+"_left"]} typeName = {typeName} propertyName={area+"_left"} label = "left" readOnly={false} getValue={getValue}/>
                    </div>
                    :  
                    <div className={styles["cellPadding"]+" "+styles["headPadding"]}>
                        <TextInput labelDisplay={"block"} defaultValue = {data[area+"_top"]} typeName = {typeName} propertyName={area+"_top"} label = "top" readOnly={false} getValue={getValue}/>
                        <TextInput labelDisplay={"block"} defaultValue = {data[area+"_bottom"]} typeName = {typeName} propertyName={area+"_bottom"} label = "bottom" readOnly={false} getValue={getValue}/>
                    </div>}
            </div>
        )
    }
}

export default CellPaddingSetting;