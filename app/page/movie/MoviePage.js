import React, {PureComponent} from 'react';
import {Text, View} from "react-native";
import SplashScreen from "react-native-splash-screen";

export default class MoviePage extends PureComponent {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
        //还是有白屏看来方法后只能这样，后期有时间再改进
        this.timer = setTimeout(() => {
            SplashScreen.hide()
        }, 100)
    }


    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    render() {
        return (
            <View>

                <Text>MoviePage</Text>
            </View>
        )
    }

}