import React, {PureComponent} from 'react';
import {
    Text, View, Animated, Dimensions, StatusBar, Modal, ActivityIndicator, TouchableOpacity,
    Image, TextInput, FlatList, Easing
} from "react-native";
import {MainColor, Movie_Types} from "../../data/constant/BaseContant";
import HttpMovieManager from "../../data/http/HttpMovieManager";
import {GrayBlackColor, GrayColor, MainBg, White, WhiteTextColor} from "../basestyle/BaseStyle";
import NaviBarView from "../../widget/NaviBarView";
import {show} from "../../utils/ToastUtils";
import LinearGradient from "react-native-linear-gradient";
import TouchableView from "../../widget/TouchableView";
import {jumpPager} from "../../utils/Utils";
import StarRating from "react-native-star-rating/StarRating";
import ErrorBean from "../../data/http/ErrorBean";


const itemHight = 200;
const moviesCount = 20;
const {width, height} = Dimensions.get('window');

export default class SearchPage extends PureComponent {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            editValue: '',
            isShowModal: false,
            searchDatas: {},
            refreshing: false,
            isCannelRequest: false,
            MainColor: MainColor
        };
        this.title = "";
        this.httpMovies = new HttpMovieManager();
        this.fadeAnim = new Animated.Value(0);
    }

    render() {
        return (
            <View style={styles.container}>
                {/*状态栏*/}
                <StatusBar
                    animated={true}
                    backgroundColor={this.state.MainColor}
                    barStyle='light-content'
                />
                <NaviBarView backgroundColor={this.state.MainColor}/>
                {this.renderContentView()}
            </View>
        )
    }


    /***
     * content
     */
    renderContentView() {
        const subjects = this.state.searchDatas.subjects;
        if (subjects == null) {
            return (
                <View style={styles.content}>
                    {/*加载中*/}
                    <Modal
                        animationType={"fade"}
                        transparent={true}
                        visible={this.state.isShowModal}
                        onRequestClose={() => {
                            this.setState({
                                isCannelRequest: true,
                                isShowModal: false,
                            });
                            show("取消搜索")
                        }}>
                        <View style={styles.modal}>
                            <LinearGradient style={styles.modal_view} colors={[this.state.MainColor, WhiteTextColor]}>
                                <ActivityIndicator
                                    style={{marginRight: 6}}
                                    animating={true}
                                    color={this.state.MainColor}
                                    size='large'/>
                                <Text style={[styles.modal_text, {color: this.state.MainColor}]}>加载中</Text>
                            </LinearGradient>
                        </View>
                    </Modal>
                    {/*搜索栏*/}
                    <View style={[styles.search_view, {backgroundColor: this.state.MainColor}]}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                            <Image
                                style={styles.search_view_back}
                                source={require('../../data/img/icon_back.png')}/>
                        </TouchableOpacity>
                        <TextInput
                            placeholder="search"
                            placeholderTextColor={GrayColor}
                            onChangeText={(text) => this.setState({editValue: text})}
                            value={this.state.editValue}
                            ref='textinput'
                            underlineColorAndroid='transparent'
                            style={styles.search_view_edit}
                        />
                        <TouchableOpacity onPress={() => {
                            if (this.state.editValue == null || this.state.editValue.length == 0) {
                                show("请输入想搜索内容")
                            } else {
                                this.refs.textinput.blur()
                                this.setState({
                                    isShowModal: true,
                                    isCannelRequest: false,
                                })
                                this.fadeAnim.setValue(0.0)
                                this.requestData(this.state.editValue)
                            }
                        }}>
                            <Image
                                style={styles.search_view_icon}
                                source={require('../../data/img/icon_search.png')}/>
                        </TouchableOpacity>
                    </View>
                    {/*推荐栏*/}
                    <View style={styles.recommend_view}>
                        {this.renderRecommendView()}
                    </View>
                </View>
            )
        } else {
            return (
                <Animated.View style={{
                    flex: 1,
                    opacity: this.fadeAnim,
                    transform: [{
                        translateX: this.fadeAnim.interpolate({
                            inputRange: [0, 1.0],
                            outputRange: [width, 0],
                        }),
                    }],
                }}>
                    <View style={styles.content}>
                        {/*搜索栏*/}
                        <View style={[styles.search_view, {backgroundColor: this.state.MainColor}]}>
                            <TouchableOpacity onPress={() => {
                                this.setState({searchDatas: {}})
                            }}>
                                <Image
                                    style={styles.search_view_back}
                                    source={require('../../data/img/icon_back.png')}/>
                            </TouchableOpacity>
                            <View style={[styles.result_view, {backgroundColor: this.state.MainColor}]}>
                                <Text style={styles.result_title} numberOfLines={1}>{this.title}</Text>
                            </View>
                        </View>
                        {/*列表栏*/}
                        <FlatList
                            data={this.state.searchDatas.subjects}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item, index}) => this.renderItemView(item, index)}
                            getItemLayout={(data, index) => this.getItemLayout(data, index)}
                            showsVerticalScrollIndicator={false}/>
                    </View>
                </Animated.View>
            )
        }
    }


    /***
     * 推荐栏
     */
    renderRecommendView() {
        return Movie_Types.map((item, i) => {
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    key={i}
                    onPress={() => {
                        this.setState({editValue: item.type})
                    }}>
                    <View
                        style={styles.recommend_view_item}>
                        <View style={[styles.recommend_view_item_icon_view, {borderColor: item.color}]}>
                            <Image source={item.icon}
                                   style={[styles.recommend_view_item_icon, {tintColor: item.color}]}/>
                        </View>
                        <Text style={[styles.recommend_view_item_text, {color: item.color}]}>{item.type}</Text>
                    </View>
                </TouchableOpacity>

            )
        })
    }


    getItemLayout(data, index) {
        return {length: itemHight, offset: itemHight * index, index}
    }

    renderItemView(item, index) {
        if (index == this.state.searchDatas.subjects.length - 1) {
            if (this.state.refreshing) {
                return (
                    <View style={styles.loading_more_view}>
                        <TouchableOpacity onPress={() => {
                            show("加载中,请稍等")
                        }}>
                            <View style={{flexDirection: 'row'}}>
                                <ActivityIndicator
                                    style={{marginRight: 6}}
                                    animating={true}
                                    color={this.state.MainColor}/>
                                <Text style={[styles.loading_more_view_text, {color: this.state.MainColor}]}>加载中</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return (
                    <View style={styles.loading_more_view}>
                        <TouchableOpacity onPress={() => {
                            if (this.state.refreshing) {
                                show('已加载中,请稍等')
                            } else {
                                this.setState({
                                    refreshing: true,
                                })
                                this.requestData(this.title)
                            }
                        }}>
                            <Text style={[styles.loading_more_view_text, {color: this.state.MainColor}]}>加载更多</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        } else {
            return (
                <TouchableView onPress={() => {
                    jumpPager(this.props.navigation.navigate, 'MovieDetail', item.id)
                }}>
                    <View style={styles.item}>
                        <Image
                            source={{uri: item.images.large}}
                            style={styles.item_img}/>
                        <View style={styles.item_right}>
                            <Text style={styles.item_right_title} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.item_right_text}
                                  numberOfLines={1}>导演: {(item.directors[0] != null ? item.directors[0].name : "未知")}</Text>
                            <Text style={styles.item_right_text}
                                  numberOfLines={2}>主演: {item.casts.map((data, i) => data.name).join(' ')}</Text>
                            <Text style={styles.item_right_text} numberOfLines={1}>{item.year}</Text>
                            <View style={styles.item_right_rating}>
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
                                <Text style={styles.item_right_rating_text}>{item.rating.average.toFixed(1)}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableView>
            )
        }
    }


    /***
     * 数据请求
     */
    requestData(str) {
        this.title = str;
        let index = 0;
        for (let i = 0; i < Movie_Types.length; i++) {
            if (Movie_Types[i] == str) {
                index = 1;
                break;
            }
        }

        let start = 0;
        if (this.state.searchDatas.start != null) {
            start = this.state.searchDatas.start + 1;
            if (this.state.searchDatas.total <= (this.state.searchDatas.start * this.state.searchDatas.count)) {
                this.setState({
                    refreshing: false,
                });
                show("已是最新数据");
                return;
            }
        }

        this.httpMovies.getSearchData(index, str, start, moviesCount)
            .then((movies) => {
                if (this.state.isCannelRequest) {
                    return;
                }
                let preSubjects = this.state.searchDatas.subjects;
                if (preSubjects != null && preSubjects.length > 0) {
                    preSubjects.filter((item, i) => {
                        return i < moviesCount;
                    }).forEach((item, i) => {
                        movies.subjects.push(item)
                    })
                }
                this.setState({
                    isShowModal: false,
                    searchDatas: movies,
                    refreshing: false,
                });
                Animated.timing(this.fadeAnim, {
                        toValue: 1.0,
                        easing: Easing.linear,
                        useNativeDriver: true,  //不加会卡住在最后一点
                    }
                ).start()
            }).catch((error) => {
            if (this.state.isCannelRequest) {
                return;
            }
            if (error != null && error instanceof ErrorBean) {
                show(error.getErrorMsg())
            } else {
                show("网络错误")
            }
            this.setState({
                isShowModal: false,
                refreshing: false,
            })
        });

    }

}

const styles = {
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        width: width,
        backgroundColor: MainBg,
        marginTop: 20
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal_view: {
        backgroundColor: White,
        width: 80,
        height: 80,
        borderRadius: 10,
        elevation: 8,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modal_text: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    search_view: {
        height: 56,
        width: width,
        alignItems: 'center',
        flexDirection: 'row',
    },
    search_view_back: {
        width: 26,
        height: 26,
        marginLeft: 20,
    },
    search_view_edit: {
        flex: 1,
        margin: 8,
        marginLeft: 20,
        marginRight: 20,
        padding: 4,
        paddingLeft: 8,
        backgroundColor: White,
        borderRadius: 30,
    },
    search_view_icon: {
        width: 26,
        height: 26,
        marginRight: 20,
    },
    recommend_view: {
        marginTop: 40,
        padding: 16,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    recommend_view_item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 16,
    },
    recommend_view_item_icon_view: {
        padding: 4,
        borderWidth: 2,
        borderRadius: 30,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recommend_view_item_icon: {
        width: 26,
        height: 26,
    },
    recommend_view_item_text: {
        fontSize: 16,
    },
    result_view: {
        height: 56,
        flex: 1,
        marginRight: 46,
        alignItems: 'center',
        justifyContent: 'center',
    },
    result_title: {
        fontSize: 16,
        fontWeight: '500',
        color: WhiteTextColor,
    },
    item: {
        height: itemHight,
        width: width,
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        borderColor: White,
        borderBottomWidth: 1,
    },
    item_img: {
        width: 96,
        height: 155,
        borderRadius: 4,
        marginRight: 10,
    },
    item_right: {
        height: itemHight - 20,
        flex: 1,
        justifyContent: 'center',
    },
    item_right_title: {
        color: GrayBlackColor,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
    },
    item_right_text: {
        fontSize: 14,
        color: GrayColor,
        marginBottom: 4,
    },
    item_right_rating: {
        flexDirection: 'row',
        marginTop: 6,
        alignItems: 'center',
    },
    item_right_rating_text: {
        fontSize: 14,
        color: '#ffcc33',
        fontWeight: '500',
        marginLeft: 8,
    },
    loading_more_view: {
        width: width,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading_more_view_text: {
        fontSize: 16,
        backgroundColor: 'transparent',
    },
}