import {StackNavigator} from "react-navigation";


const App = StackNavigator({
    Movie:{
        screen:MoviePage
    },
    MovieDetail:{
        screen:MovieDetailPage
    },
    MovieList:{
        screen:MovieListPage
    },
    ImageDetailBrower:{
        screen:ImageDetailBrowerPage
    },
    Search:{
        screen:SearchPage
    },
    Theme:{
        screen:ThemePage
    },

});

export default App