import React, {PureComponent} from 'react';
import {Text, View, StyleSheet} from "react-native";
import SplashScreen from "react-native-splash-screen";
import {queryThemeColor} from "../../data/realm/RealmManager";
import HttpMovieManager from "../../data/http/HttpMovieManager";
import {show} from "../../utils/ToastUtils";
import ErrorBean from "../../data/http/ErrorBean";

const itemHight = 200;
const moviesCount = 20;

export default class MoviePage extends PureComponent {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            hotMovies: {},
            refreshing: true,
            isInit: false,
            MainColor: queryThemeColor(),
        };
        this.httpMovies = new HttpMovieManager();
        this.requestData();
    }


    componentDidMount() {
        //还是有白屏看来方法后只能这样，后期有时间再改进
        this.timer = setTimeout(() => {
            // SplashScreen.hide();
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

    requestData() {
        let start = 0;
        if (this.state.hotMovies.start != null) {
            start = this.state.hotMovies.state + 2;
            if (this.state.hotMovies.total <= this.state.hotMovies.start) {
                this.setState({
                    refreshing: false,
                });
                show("已是最新数据");
                return;
            }
        }

        this.httpMovies.getHottingMovie(this.state.isInit, start, moviesCount)
            .then((movies) => {
                console.log("movies = " + movies);
                let preSubjects = this.state.hotMovies.subjects;
                if (preSubjects != null && subjects.length > 0) {
                    preSubjects.filter((item, i) => {
                        return i < moviesCount;
                    }).forEach((item, i) => {
                        movies.subjects.push(item);
                    })
                }
                this.setState({
                    hotMovies: movies,
                    refreshing: false,
                    isInit: true,
                });

            }).catch((error) => {
            if (error != null && error instanceof ErrorBean) {
                show(error.getErrorMsg());
            } else {
                show("net error");
            }

            this.setState({
                refreshing: false
            })
        });

    }


}

const styles = StyleSheet.create({});