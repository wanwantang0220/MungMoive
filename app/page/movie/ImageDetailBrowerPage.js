import React, {PureComponent} from 'react';
import {
    Text, View, Animated, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions,
    StatusBar, Image, Platform, CameraRoll, Easing
} from "react-native";
import {MainColor} from "../../data/constant/BaseContant";
import HttpMovieManager from "../../data/http/HttpMovieManager";
import ErrorBean from "../../data/http/ErrorBean";
import {show} from "../../utils/ToastUtils";
import LinearGradient from "react-native-linear-gradient";
import {MainBg, WhiteTextColor} from "../basestyle/BaseStyle";
import Swiper from 'react-native-swiper'

const {width, height} = Dimensions.get('window');


/***
 * 图片浏览
 */
export default class ImageDetailBrowerPage extends PureComponent {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            paginationIndex: this.props.navigation.state.params.data.index,
            isInitSuccess: true,
            imageDatas: [],
            MainColor: MainColor,
        };
        this.isStartAnim = false;
        this.fadeAnim = new Animated.Value(0);
        this.httpImages = new HttpMovieManager();
        this.requestPhotos();
    }

    render() {
        if (this.state.imageDatas.length == 0) {
            return (
                this.state.isInitSuccess ? (
                    <LinearGradient style={styles.loading_view} colors={[this.state.MainColor, WhiteTextColor]}>
                        <ActivityIndicator
                            animating={true}
                            color={this.state.MainColor}
                            size='large'/>
                        <Text style={[styles.loading_text, {color: this.state.MainColor}]}>loading</Text>
                    </LinearGradient>
                ) : (
                    <LinearGradient style={styles.loading_view} colors={[this.state.MainColor, WhiteTextColor]}>
                        <TouchableOpacity onPress={() => {
                            this.setState({isInitSuccess: true});
                            this.requestPhotos();
                        }}>
                            <Text style={[styles.reload_view, {
                                color: this.state.MainColor,
                                borderColor: this.state.MainColor,
                            }]}>reloading</Text>
                        </TouchableOpacity>
                    </LinearGradient>)
            )
        } else {
            return (
                <LinearGradient style={styles.container} colors={[this.state.MainColor, WhiteTextColor]}>
                    {/*状态栏*/}
                    <StatusBar
                        animated={true}
                        backgroundColor={this.state.MainColor}
                        barStyle='light-content'
                    />
                    {/*状态栏*/}
                    <View style={styles.toolbar_view}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                            <Image
                                style={styles.toolbar_view_img}
                                source={require('../../data/img/icon_back.png')}/>
                        </TouchableOpacity>
                        <Text style={styles.toolbar_view_text}>
                            {this.state.paginationIndex + 1}/{this.state.imageDatas.length}
                        </Text>
                        {this.renderDownImage()}
                    </View>
                    {/*大图浏览*/}
                    <View style={styles.swiper_view}>
                        <Swiper
                            loop={false}
                            showsPagination={false}
                            index={this.props.navigation.state.params.data.index}
                            onIndexChanged={(index) => {
                                this.setState({
                                    paginationIndex: index
                                })
                            }}>
                            {this.renderSwiperItemView()}
                        </Swiper>
                    </View>
                </LinearGradient>
            )
        }
    }


    renderDownImage() {
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.toolbar_view_downview}>
                    <TouchableOpacity onPress={() => {
                        if (Platform.OS === 'android') {
                            // this.checkedPermissionAndDownImage()
                        } else {
                            this.downToPicture()
                        }
                    }}>
                        <Image
                            style={styles.toolbar_view_down}
                            source={require('../../data/img/icon_down.png')}/>
                    </TouchableOpacity>
                </View>
            )
        }
    }


    /***
     * 浏览
     */
    renderSwiperItemView() {
        return this.state.imageDatas.map((item, i) => {
            return (
                <View
                    key={i}
                    style={styles.swiper_bigimg_view}>
                    <Animated.Image
                        source={{uri: item.image}}
                        onLoad={() => {
                            if (this.isStartAnim) {
                                this.isStartAnim = false;
                                this.fadeAnim.setValue(0);
                                Animated.timing(this.fadeAnim, {
                                        toValue: 1.0,
                                        easing: Easing.linear,
                                        useNativeDriver: true,  //不加会卡住在最后一点
                                    }
                                ).start()
                            }
                        }}
                        style={[styles.swiper_bigimg_image, {
                            opacity: this.fadeAnim,
                            transform: [{
                                scale: this.fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.2, 1],
                                })
                            }]
                        }]}/>
                </View>
            )
        })
    }


    /***
     * download
     */
    downToPicture() {
        try {
            CameraRoll.saveToCameraRoll(this.state.imageDatas[this.state.paginationIndex].image)
                .then((res) => {
                    show('保存成功')
                }).catch((error) => {
                show('保存失败')
            })
        } catch (error) {
            show('保存异常')
        }
    }

    /***
     * 数据请求
     */
    requestPhotos() {
        const id = this.props.navigation.state.params.data.id;
        const count = this.props.navigation.state.params.data.count;
        this.httpImages.getPhotoDatas(id, count)
            .then((data) => {
                this.isStartAnim = true;
                this.setState({imageDatas: data.photos});
                console.log(data.photos);
            }).catch((error) => {
            if (error != null && error instanceof ErrorBean) {
                show(error.getErrorMsg())
            } else {
                show("网络错误")
            }
            this.setState({isInitSuccess: false})
        })
    }


}

const styles = {
    loading_view: {
        flex: 1,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: MainBg,
    },
    loading_text: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 6,
        backgroundColor: 'transparent',
    },
    reload_view: {
        padding: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
        borderWidth: 3,
        borderRadius: 6,
    },
    container: {
        flex: 1,
        backgroundColor: MainBg,
    },
    toolbar_view: {
        height: 56 + 20,
        width: width,
        position: 'absolute',
        zIndex: 1,
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    toolbar_view_img: {
        width: 26,
        height: 26,
        marginLeft: 16,
    },
    toolbar_view_downview: {
        flex: 1,
        height: 56,
        alignItems: 'center',
        flexDirection: 'row-reverse'
    },
    toolbar_view_down: {
        width: 26,
        height: 26,
        marginRight: 16,
    },
    toolbar_view_text: {
        color: WhiteTextColor,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 16,
        backgroundColor: 'transparent',
    },
    swiper_view: {
        flex: 1,
        width: width,
    },
    swiper_bigimg_view: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        flex: 1,
    },
    swiper_bigimg_image: {
        width: width,
        flex: 1,
        resizeMode: 'contain',
    },
};