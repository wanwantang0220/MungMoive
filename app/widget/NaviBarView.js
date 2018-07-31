import React,{Component} from 'react'
import {
    View,
    Platform
} from 'react-native'
import PropTypes from 'prop-types';

export default class NaviBarView extends Component {

    static propTypes = {
        backgroundColor: PropTypes.string
    };

    render() {
        const naviHeight = (Platform.OS === 'ios') ?
            20 : 0;
        return (
            <View style={{
                height: naviHeight,
                backgroundColor: this.props.backgroundColor
            }}>

            </View>
        )
    }

}