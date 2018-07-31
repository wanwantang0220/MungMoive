import {StackNavigator} from "react-navigation";
import MoviePage from "./page/movie/MoviePage";
import MovieDetailPage from "./page/movie/MovieDetailPage";
import MovieListPage from "./page/movie/MovieListPage";
import ImageDetailBrowerPage from "./page/movie/ImageDetailBrowerPage";
import SearchPage from "./page/movie/SearchPage";
import ThemePage from "./page/movie/ThemePage";
import CardStackStyleInterpolator from "react-navigation/src/views/StackView/StackViewStyleInterpolator";


const App = StackNavigator({
    Movie: {
        screen: MoviePage
    },
    MovieDetail: {
        screen: MovieDetailPage
    },
    MovieList: {
        screen: MovieListPage
    },
    ImageDetailBrower: {
        screen: ImageDetailBrowerPage
    },
    Search: {
        screen: SearchPage
    },
    Theme: {
        screen: ThemePage
    },

}, {
    navigationOptions: {
        gesturesEnabled: true,
    },
    headerMode: 'screen',
    transitionConfig: (() => ({
        screenInterpolator: CardStackStyleInterpolator.forHorizontal
    }))
});

export default App