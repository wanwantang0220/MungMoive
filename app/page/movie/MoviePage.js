import React, {PureComponent} from 'react';
import {
    Text, View, StyleSheet, StatusBar, Dimensions, TouchableOpacity, Image, ScrollView,
    RefreshControl, FlatList
} from "react-native";
import HttpMovieManager from "../../data/http/HttpMovieManager";
import {show} from "../../utils/ToastUtils";
import ErrorBean from "../../data/http/ErrorBean";
import Swiper from 'react-native-swiper'
import NaviBarView from "../../widget/NaviBarView";
import {GrayWhiteColor, Translucent, White, WhiteTextColor} from "../basestyle/BaseStyle";
import {jumpPager} from "../../utils/Utils";
import TouchableView from "../../widget/TouchableView";
import StarRating from "react-native-star-rating";
import {Cate_Data} from "../../data/constant/BaseContant";
import LinearGradient from 'react-native-linear-gradient'
import {MainColor} from "../../data/constant/BaseContant";


const itemHight = 200;
const moviesCount = 20;
const {width, height} = Dimensions.get('window');


const THEME_PIC = require('../../data/img/icon_theme.png');
const SEARCH_PIC = require('../../data/img/icon_search.png');
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
            MainColor:MainColor,
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
                        onPress={() => {
                            jumpPager(this.props.navigation.navigate, "Search", null)
                        }}>
                        <Image
                            source={SEARCH_PIC}
                            style={styles.toolbar_right_img}
                            tintColor={White}/>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.scrollview_container}
                            showsVerticalScrollIndicator={false}
                            refreshControl={this.refreshControlView()}>
                    {this.getContentView()}
                </ScrollView>
            </View>
        )
    }

    refreshControlView() {
        return (
            <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => {
                    this.refresh()
                }}
                colors={['#ff0000', '#00ff00', '#0000ff']}/>
        )
    }

    refresh() {
        this.setState({
            refreshing: true
        });
        this.requestData();
    }


    getContentView() {
        if (this.state.isInit) {
            return (
                <View style={styles.content_view}>
                    <View style={styles.middle_view}>
                        <View style={styles.swiper}>
                            <Swiper
                                showsButtons={true}
                                height={220}
                                autoplay={true}
                                autoplayTimeout={1000}
                                dot={<View style={styles.swiper_dot}/>}
                                activeDot={<View style={styles.swiper_activeDot}/>}
                                paginationStyle={styles.swiper_pagination}>
                                {this.swiperChildrenView()}
                            </Swiper>
                        </View>
                        {/*分类栏*/}
                        <View style={[styles.cate_view, {backgroundColor: this.state.MainColor,}]}>
                            {this.cateChildrenView()}
                        </View>
                    </View>
                    {/*列表*/}
                    <View style={styles.flat_view}>
                        <FlatList
                            data={this.getHotMovieDatas(false)}
                            keyExtractor={(item, index) => index}
                            renderItem={
                                ({item}) => this.renderItemView(item)
                            }
                            getItemLayout={(data, index) => this.getItemLayout(data, index)}
                            showsVerticalScrollIndicator={false}
                            numColumns={3}
                        />
                    </View>

                </View>
            )
        } else {
            <View style={styles.content_view}/>
        }


    }


    /***
     * 状态栏
     * @returns {*|{}|Object|Uint8Array|any[]|Int32Array}
     */
    swiperChildrenView() {
        let items = this.getHotMovieDatas(true);
        if (items != null && items.length > 0) {
            return items.map((item, i) => {
                return (
                    <TouchableView
                        key={i}
                        onPress={() => {
                            jumpPager(this.props.navigation.navigate, 'MovieDetail', item.id)
                        }}>
                        <View
                            style={[styles.swiper_children_view, {backgroundColor: this.state.MainColor}]}>
                            <Image
                                style={styles.swiper_children_cover}
                                source={{uri: item.images.large}}/>
                            <View style={styles.swiper_children_right}>
                                <Text style={styles.swiper_children_title}
                                      numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <View style={styles.swiper_children_director}>
                                    <Image
                                        source={{uri: item.directors[0].avatars.small}}
                                        style={styles.swiper_children_director_img}
                                    />
                                    <Text style={styles.swiper_children_director_name}
                                          numberOfLines={1}>
                                        {(item.directors[0] != null ? item.directors[0].name : "未知")}
                                    </Text>
                                </View>
                                <View style={styles.swiper_children_casts_view}>
                                    <Text
                                        style={styles.swiper_children_casts_text}
                                        numberOfLines={2}>
                                        主演: {item.casts.map((data, i) => data.name).join(' ')}
                                    </Text>
                                </View>
                                <View style={styles.swiper_children_genres_view}
                                      numberOfLines={2}>
                                    <Text style={styles.swiper_children_genres_text}>{item.collect_count} 看过</Text>
                                </View>
                                <View style={styles.swiper_children_rating_view}>
                                    <StarRating
                                        disabled={false}
                                        rating={item.rating.average / 2}
                                        maxStars={5}
                                        halfStarEnabled={true}
                                        emptyStar={require('../../data/img/icon_unselect.png')}
                                        halfStar={require('../../data/img/icon_half_select.png')}
                                        fullStar={require('../../data/img/icon_selected.png')}
                                        starStyle={{width: 20, height: 20}}
                                        selectedStar={(rating) => {
                                        }}/>
                                    <Text
                                        style={styles.swiper_children_rating_text}>{item.rating.average.toFixed(1)}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableView>
                )
            });
        }
    }

    getHotMovieDatas(isBanner) {
        let items = [];
        let movieDatas = this.state.hotMovies.subjects;
        if (movieDatas != null && movieDatas.length > 4) {
            if (isBanner) {
                for (let i = 0; i < 4; i++) {
                    items.push(movieDatas[i]);
                }
            } else {
                for (let i = 4; i < movieDatas.length; i++) {
                    items.push(movieDatas[i]);
                }
            }
        }
        return items;
    }

    /***
     * 分类栏
     */
    cateChildrenView() {
        return Cate_Data.map((item, i) => {
            return (
                <TouchableView
                    key={i}
                    style={styles.cate_children_touchview}
                    onPress={() => {
                        jumpPager(this.props.navigation.navigate, 'MovieList', {
                            index: item.index,
                            title: item.title
                        })
                    }}>
                    <View style={styles.cate_children_view}>
                        <LinearGradient
                            colors={item.colors}
                            style={styles.cate_children_linear}>
                            <Image
                                source={item.icon}
                                style={styles.cate_children_image}/>
                        </LinearGradient>
                        <Text
                            style={styles.cate_children_text}>
                            {item.title}
                        </Text>
                    </View>
                </TouchableView>
            )
        });

    }


    /***
     * 列表item
     */
    renderItemView(item){
        return (
            <View style={styles.flat_item}>
                <TouchableView
                    style={styles.flat_item_touchableview}
                    onPress={()=>{
                        jumpPager(this.props.navigation.navigate,'MovieDetail',item.id)
                    }}>
                    <View style={[styles.flat_item_view,{backgroundColor: this.state.MainColor}]}>
                        <Image
                            source={{uri:item.images.large}}
                            style={styles.flat_item_image}/>
                        <View style={[styles.flat_item_detail,{backgroundColor: this.state.MainColor}]}>
                            <Text style={styles.flat_item_title}
                                  numberOfLines={1}>
                                {item.title}
                            </Text>
                            <View style={styles.flat_item_rating_view}>
                                <StarRating
                                    disabled={false}
                                    rating={item.rating.average/2}
                                    maxStars={5}
                                    halfStarEnabled={true}
                                    emptyStar={require('../../data/img/icon_unselect.png')}
                                    halfStar={require('../../data/img/icon_half_select.png')}
                                    fullStar={require('../../data/img/icon_selected.png')}
                                    starStyle={{width: 14, height: 14}}
                                    selectedStar={(rating)=>{}}/>
                                <Text style={styles.flat_item_rating_number} numberOfLines={1}>{item.rating.average.toFixed(1)}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableView>
            </View>
        )
    }


    getItemLayout(data, index) {
        return {length: itemHight,offset: itemHight*index,index}
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
                if (preSubjects != null && preSubjects.length > 0) {
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
        marginTop: 20
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
        // backgroundColor: Translucent,
        // width: 16,
        // height: 2,
        // borderRadius: 1,
        // marginLeft: 2,
        // marginRight: 2,

        backgroundColor: 'rgba(0,0,0,.5)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    swiper_activeDot: {
        backgroundColor: WhiteTextColor,
        width: 16,
        height: 2,
        borderRadius: 1,
        marginLeft: 2,
        marginRight: 2,

        // backgroundColor: '#0072E3',
        // width: 8,
        // height: 8,
        // borderRadius: 4,
        // marginLeft: 3,
        // marginRight: 3,
        // marginTop: 3,
        // marginBottom: 3,
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