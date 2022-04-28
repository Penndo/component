import * as React from "react"
import TextInput from "../../Public/TextInput";

class TableWidth extends React.Component {
    render(){
        const {getValue,typeName} = this.props
        return (
            <div>
                <p>{this.props.type}</p>
                <TextInput defaultValue = {this.props.data} typeName = {typeName} propertyName = "tableWidth" labelDisplay = "none" readOnly={false} getValue = {getValue}/>
            </div>
        )
    }
}

export default TableWidth;