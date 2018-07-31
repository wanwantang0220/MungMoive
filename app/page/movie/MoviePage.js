import React, {PureComponent} from 'react';
import {Text, View, StyleSheet, StatusBar, Dimensions, TouchableOpacity, Image} from "react-native";
import HttpMovieManager from "../../data/http/HttpMovieManager";
import {show} from "../../utils/ToastUtils";
import ErrorBean from "../../data/http/ErrorBean";
import NaviBarView from "../../widget/NaviBarView";
import {GrayWhiteColor, Translucent, White, WhiteTextColor} from "../basestyle/BaseStyle";
import {jumpPager} from "../../utils/Utils";
// import SplashScreen from "react-native-splash-screen";
// import {queryThemeColor} from "../../data/realm/RealmManager";
// import HttpMovieManager from "../../data/http/HttpMovieManager";
// import {show} from "../../utils/ToastUtils";
// import ErrorBean from "../../data/http/ErrorBean";

const itemHight = 200;
const moviesCount = 20;
const {width, height} = Dimensions.get('window');


const THEME_PIC = require('../../data/img/icon_theme.png');
const SEARCH_PIC= require('../../data/img/icon_search.png');
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
            MainColor: '#28FF28',
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
            <View style={styles.container}>
                {/*状态栏*/}
                <StatusBar
                    animated={true} //指定状态栏的变化是否应以动画形式呈现。目前支持这几种样式：backgroundColor, barStyle和hidden
                    hidden={false}  //是否隐藏状态栏。
                    backgroundColor={this.state.MainColor} //状态栏的背景色
                    translucent={true}//指定状态栏是否透明。设置为true时，应用会在状态栏之下绘制（即所谓“沉浸式”——被状态栏遮住一部分）。常和带有半透明背景色的状态栏搭配使用。
                    barStyle='light-content'
                />
                <NaviBarView backgroundColor={this.state.MainColor}/>
                <View style={[styles.toolbar, {backgroundColor: this.state.MainColor}]}>

                    <TouchableOpacity
                        onPress={() => {
                            jumpPager(this.props.navigation.navigate, "Theme", this.onChangeTheme.bind(this))
                        }}>
                        <Image
                            source={THEME_PIC}
                            style={styles.toolbar_left_img}
                            tintColor={White}/>
                    </TouchableOpacity>
                    <View style={styles.toolbar_middle}>
                        <Text style={styles.toolbar_middle_text}>Mung</Text>
                    </View>
                    <TouchableOpacity
                        onPress={()=>{
                            jumpPager(this.props.navigation.navigate,"Search",null)
                        }}>
                        <Image
                            source={SEARCH_PIC}
                            style={styles.toolbar_right_img}
                            tintColor={White}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    onChangeTheme() {
        this.setState({
            MainColor: '#FF5151', //技巧
        })
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
                console.log(movies.subjects);
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    toolbar: {
        height: 56,
        width: width,
        alignItems: 'center',
        flexDirection: 'row',
        marginTop:20
    },
    toolbar_left_img: {
        width: 26,
        height: 26,
        alignSelf: 'center',
        marginLeft: 20,
    },
    toolbar_middle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolbar_middle_text: {
        fontSize: 18,
        fontWeight: '600',
        color: White
    },
    toolbar_right_img: {
        width: 26,
        height: 26,
        alignSelf: 'center',
        marginRight: 20,
    },
    scrollview_container: {
        flex: 1,
    },
    content_view: {
        flex: 1,
    },
    middle_view: {
        backgroundColor: WhiteTextColor,
        paddingBottom: 10,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    swiper: {
        height: 220,
    },
    swiper_dot: {
        backgroundColor: Translucent,
        width: 16,
        height: 2,
        borderRadius: 1,
        marginLeft: 2,
        marginRight: 2,
    },
    swiper_activeDot: {
        backgroundColor: WhiteTextColor,
        width: 16,
        height: 2,
        borderRadius: 1,
        marginLeft: 2,
        marginRight: 2,
    },
    swiper_pagination: {
        justifyContent: 'flex-end',
        marginRight: 20,
    },
    swiper_children_view: {
        height: 200,
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 6,
    },
    swiper_children_cover: {
        width: 112,
        height: 180,
        borderRadius: 4,
    },
    swiper_children_right: {
        marginTop: 20,
        height: 180,
        marginLeft: 20,
    },
    swiper_children_title: {
        fontSize: 18,
        marginBottom: 10,
        color: WhiteTextColor
    },
    swiper_children_director: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    swiper_children_director_img: {
        width: 26,
        height: 26,
        borderRadius: 13,
        marginRight: 8,
    },
    swiper_children_director_name: {
        fontSize: 14,
        color: GrayWhiteColor
    },
    swiper_children_casts_view: {
        width: width - 190,
        marginBottom: 10,
    },
    swiper_children_casts_text: {
        fontSize: 14,
        flexWrap: 'wrap',
        color: GrayWhiteColor
    },
    swiper_children_rating_view: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    swiper_children_rating_text: {
        fontSize: 14,
        color: '#ffcc33',
        fontWeight: '500',
        marginLeft: 8,
    },
    swiper_children_genres_view: {
        width: width - 190,
        marginBottom: 10,
    },
    swiper_children_genres_text: {
        fontSize: 14,
        flexWrap: 'wrap',
        color: GrayWhiteColor,
    },
    cate_view: {
        height: 72,
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 4,
    },
    cate_children_touchview: {
        width: (width - 20) / 4,
        height: 72,
    },
    cate_children_view: {
        width: (width - 20) / 4,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cate_children_linear: {
        width: 42,
        height: 42,
        borderRadius: 26,
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cate_children_image: {
        width: 26,
        height: 26,
    },
    cate_children_text: {
        fontSize: 14,
        color: WhiteTextColor,
    },
    flat_view: {
        flex: 1,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: GrayWhiteColor,
    },
    flat_item: {
        height: itemHight,
        width: (width - 10) / 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flat_item_touchableview: {
        height: itemHight - 16,
    },
    flat_item_view: {
        height: itemHight - 16,
        alignItems: 'center',
        borderRadius: 4,
    },
    flat_item_image: {
        width: (width - 10) / 3 - 10,
        height: itemHight - 26,
        borderRadius: 4,
    },
    flat_item_detail: {
        width: (width - 10) / 3 - 10,
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        padding: 2,
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 4,
    },
    flat_item_title: {
        fontSize: 14,
        color: WhiteTextColor,
    },
    flat_item_rating_view: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flat_item_rating_number: {
        fontSize: 12,
        color: '#ffcc33',
        fontWeight: '500',
        marginLeft: 4,
    },
});