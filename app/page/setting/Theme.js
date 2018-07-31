
import React,{Component} from 'react';

const itemHight = 200;

export default class Theme extends Component {

    static navigationOptions = {
        header: null
    };

    getItemLayout(data, index) {
        return {length: itemHight,offset: itemHight*index,index}
    }

    constructor(props) {
        super(props);
        this.state= {
            // MainColor: queryThemeColor()
        };
        // this.fadeAnim = new Animated.Value(0)
    }
}