import { React} from "react";
import {useDispatch} from 'react-redux'
import {Link, useNavigate} from 'react-router-dom';
import { AiFillDelete } from "react-icons/ai";

import "../ItemCatalogueList/ItemCatalogueList.scss";
import { updateWatchlistRecord, banishWatched, banishWantToWatch } from "../../features/watchlists/watchlistSlice";

const ItemCatalogueList = (props) => {
  const image_path = "https://image.tmdb.org/t/p/original";
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { movies, allowDeleteWantToWatch, allowDeleteWatched, banishRecord } = props;
  
  const viewMovie = (id) => {
    if(id){
      navigate('/movie/' + id)
    }
  }

  const removeFromList = (data) => {
    let m = {...data};
    if(allowDeleteWatched){
      m.watched = false;
      dispatch(banishWatched(m));
      dispatch(updateWatchlistRecord({movie: m}))
      banishRecord(m, 'watched')
    }
    
    else if(allowDeleteWantToWatch){
      m.wantToWatch = false;
      dispatch(banishWantToWatch(m));
      dispatch(updateWatchlistRecord({movie: m}))
    }
  }

  return (
    <div className="item-catalogue-list-container">
      <div className="inner-container">
        {movies && movies.map((movie) => (
            <div className="relative">
              {movie.movie_id && <button onClick={() => {removeFromList(movie)}}  type="button" className="absolute top-0 right-0 z-10 border-0 text-white bg-red-700 hover:bg-red-800 text-center p-3 rounded-tr-none rounded-br-none"><AiFillDelete/></button>}       
              <Link to={`/movie/${movie.id ? movie.id : movie.movie_id}`} key={movie.id ? movie.id : movie.movie_id}>
                <img className="hover:cursor-pointer" onClick={() => viewMovie(movie.id ? movie.id : movie.movie_id)} src={movie.poster_path ? image_path + movie.poster_path : image_path + movie.movie_image} alt='movie-list'></img>
              </Link>
            </div>
          
        ))}
      </div>
    </div>
  );
};

export default ItemCatalogueList;
