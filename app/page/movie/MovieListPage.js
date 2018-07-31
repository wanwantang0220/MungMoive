
import React,{PureComponent} from 'react';
import {Text, View} from "react-native";

export default class MovieListPage extends  PureComponent{

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render(){
        return(
            <View>

                <Text>MoviePage</Text>
            </View>
        )
    }

}