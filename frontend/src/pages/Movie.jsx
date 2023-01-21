import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { BiStar } from "react-icons/bi";
import { AiFillEye, AiFillPlusCircle } from "react-icons/ai";
import Rating from "react-rating";
import {
  createComment,
  getCommentsByMovieId,
} from "../features/comments/commentSlice";
import {
  getWantToWatchRecord,
  updateWatchlistRecord,
} from "../features/watchlists/watchlistSlice";
import { reset } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import { ColourPalette } from "../components/ColourPalette/ColourPalette";
import noCastImg from "../static/svgs/user.svg";
import starImg from "../static/svgs/star.svg";

import Filter from "bad-words";

const Movie = () => {
  const [text, setText] = useState("");
  const [rating, setRating] = useState("");

  // let rating = "";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading, isError, message } = useSelector(
    (state) => state.comments
  );
  const [commentErr, setCommentErr] = useState("");
  const [movie, setMovie] = useState(null);
  const [movieAddedPrompt, setMovieAddedPrompt] = useState('');
  const [movieVideos, setMovieVideos] = useState(null);
  const [movieImages, setMovieImages] = useState(null);
  const [movieCast, setMovieCast] = useState(null);
  const [disableWantToWatch, setDisableWantToWatch] = useState(false);
  const [disableWatched, setDisableWatched] = useState(false);
  const [userWatchlistRecord, setUserWatchlistRecord] = useState(null);

  //display variables
  const [showImages, setShowImages] = useState(false);
  const [showCast, setShowCast] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);

  let image_path = "https://image.tmdb.org/t/p/original";
  let colours = ColourPalette(movie ? image_path + movie?.poster_path : []);

  const onSubmit = (e) => {
    setCommentErr('');
    if (text === '') {
      setCommentErr("Please add a message with your rating");
      return;
    }
    if (text.length > 600) {
      setCommentErr("Max character length is 600 characters.");
      return;
    }

    let filter = new Filter();
    if (text && rating && id) {
      dispatch(
        createComment({
          comment: filter.clean(text),
          rating: rating,
          movie_id: `${id}`,
        })
      );
      setText("");
      setRating("");
    }
  };

  useEffect(() => {
    if (!isError) {
      console.log(message);
    }

    if (!user) {
      navigate("/login");
    }

    const getRecord = async () => {
      const record = await getWantToWatchRecord({ movie_id: id });
      setUserWatchlistRecord(record);
    };

    getRecord();

    dispatch(getCommentsByMovieId(id));
    return () => {
      dispatch(reset());
    };
  }, [id, user, navigate, dispatch, isError, message]);

  useEffect(() => {
    if (!movie) {
      axios
        .get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=120fe4d587d5f86c44f0a6e599f01734&language=en-US`
        )
        .then((resp) => {
          setMovie(resp.data);
        });

      axios
        .get(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=120fe4d587d5f86c44f0a6e599f01734&language=en-US`
        )
        .then((resp) => {
          let res = resp.data.results;
          let temp = [];

          if (res.length > 0) {
            for (let index = 0; index < res.length; index++) {
              const element = res[index];

              if (element.type === "Trailer") {
                temp.push(element);
              }
            }
            setMovieVideos(temp);
          }
        });

      axios
        .get(
          `https://api.themoviedb.org/3/movie/${id}/images?api_key=120fe4d587d5f86c44f0a6e599f01734`
        )
        .then((resp) => {
          let res = resp.data;
          let temp = [];

          if (res.backdrops.length > 0) {
            for (let index = 0; index < res.backdrops.length; index++) {
              const element = res.backdrops[index];

              if (temp.length === 6) {
                break;
              }
              temp.push(element);
            }
            setMovieImages(temp);
          }
        });

      axios
        .get(
          `https://api.themoviedb.org/3/movie/${id}/credits?api_key=120fe4d587d5f86c44f0a6e599f01734`
        )
        .then((resp) => {
          let res = resp.data;
          let temp = [];

          if (res.cast.length > 0) {
            for (let index = 0; index < res.cast.length; index++) {
              const element = res.cast[index];

              if (temp.length === 6) {
                break;
              }
              temp.push(element);
            }
            setMovieCast(temp);
          }
        });
    }
  }, [id, movie]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const setMovieRating = (val) => {
    setRating(val);
  };

  if (isLoading) {
    return <Spinner />;
  }

  const addToWantToWatchList = async(val) => {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    if (movie) {
      let genres = [];
      for (let index = 0; index < movie.genres.length; index++) {
        const element = movie.genres[index];
        genres.push(element.name);
      }

      dispatch(
        updateWatchlistRecord({
          movie: {
            movie_id: id,
            movie_genre: genres,
            movie_image: image_path + movie.poster_path,
            wantToWatch: true,
          },
        })
      );
      setMovieAddedPrompt('Added to Watchlist.')
      await delay(2000);
      setMovieAddedPrompt('')

    }
  };

  const addToWatchedList = async(val) => {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    if (movie) {
      let genres = [];
      for (let index = 0; index < movie.genres.length; index++) {
        const element = movie.genres[index];
        genres.push(element.name);
      }

      dispatch(
        updateWatchlistRecord({
          movie: {
            movie_id: id,
            movie_genre: genres,
            movie_image: image_path + movie.poster_path,
            watched: true,
          },
        })
      );
      setMovieAddedPrompt('Added to Watched')
      await delay(2000);
      setMovieAddedPrompt('')
    }
  };

  const imagesSection = (
    <div>
      <div className='section-title'>
        <h2 onClick={() => setShowImages(!showImages)}>Images</h2>
        {/* background Svg */}
      </div>
      {showImages && (
        <div className='movie-content'>
          {movieImages &&
            movieImages.map((image) => (
              <img src={image_path + image.file_path} alt='movie'></img>
            ))}
        </div>
      )}
    </div>
  );

  const castSection = (
    <div>
      <div className='section-title'>
        <h2 onClick={() => setShowCast(!showCast)}>Cast</h2>
        {/* background Svg */}
      </div>
      {showCast && (
        <div className='movie-content'>
          {movieCast &&
            movieCast.map((member) => (
              <div className='castMember mb-10'>
                {member.profile_path ? (
                  <img
                    onClick={() =>
                      window
                        .open(
                          "http://google.com/search?q=" + member.name,
                          "_blank"
                        )
                        .focus()
                    }
                    src={image_path + member.profile_path}
                    alt='cast_memebr'
                  />
                ) : (
                  <div
                    onClick={() =>
                      window
                        .open(
                          "http://google.com/search?q=" + member.name,
                          "_blank"
                        )
                        .focus()
                    }
                  >
                    <img
                      onClick={() =>
                        window
                          .open(
                            "http://google.com/search?q=" + member.name,
                            "_blank"
                          )
                          .focus()
                      }
                      src={noCastImg}
                      alt='no_cast_img'
                    />
                  </div>
                )}
                <p className="truncate" >{member.name}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  const productionCompanies = (
    <div>
      <div className='section-title'>
        <h2 onClick={() => setShowCompanies(!showCompanies)}>
          Production companies
        </h2>
        {/* background Svg */}
      </div>
      {showCompanies && (
        <div className='movie-content'>
          {movie &&
            movie.production_companies.map((company) => (
              <>
                {/* <p>{company.name}</p> */}
                {company.logo_path ? (
                  <img src={image_path + company.logo_path} alt='company'></img>
                ) : (
                  ""
                )}
              </>
            ))}
        </div>
      )}
    </div>
  );

  // const genreSearch = (genre) => {
  //   if(genre){
  //       axios.get(`https://api.themoviedb.org/3/search/movie?api_key=120fe4d587d5f86c44f0a6e599f01734&with_genres=${genre}&language=en-US&page=1`)
  //     .then((resp) => {
  //     });
  //   }
  // }

  return (
    <>
      <div
        className='p-0.5'
        style={
          colours
            ? {
                background: `linear-gradient(90deg,rgba(0,0,0,0),${colours[0]}, ${colours[1]}, ${colours[2]}, ${colours[3]}, ${colours[4]}, rgba(0,0,0,0))`,
              }
            : {}
        }
      ></div>
      {movie && (
        <div className='container'>
          <div className='movie-container mb-20 mt-5'>
            <div className='movieInfo'>
              <img src={image_path + movie.poster_path} alt='movie'></img>
              <p className="text-sm">{movieAddedPrompt}</p>
              <div className='buttons flex justify-evenly gap-1 mt-2'>
                <button
                  disabled={disableWantToWatch}
                  className={`w-full flex gap-3 p-3 ${
                    userWatchlistRecord?.wantToWatch || disableWantToWatch
                      ? "bg-blue-600 opacity-50"
                      : ""
                  }`}
                  onClick={() => {
                    addToWantToWatchList();
                    setDisableWantToWatch(true);
                  }}
                >
                  {" "}
                  <div className='my-auto'>
                    <AiFillPlusCircle />
                  </div>
                  Watchlist
                </button>
                <button
                  disabled={disableWatched}
                  className={`w-full flex gap-3 p-3 ${
                    userWatchlistRecord?.watched || disableWatched
                      ? "bg-blue-600 opacity-50"
                      : ""
                  }`}
                  onClick={() => {
                    addToWatchedList();
                    setDisableWatched(true);
                  }}
                >
                  {" "}
                  <div className='my-auto'>
                    <AiFillEye />
                  </div>{" "}
                  Watched
                </button>
              </div>
              {movie.homepage && (
                <button
                  onClick={() => {
                    window.open(movie.homepage ?? "", "_blank");
                  }}
                  className='w-full mt-1'
                >
                  Watch Now
                </button>
              )}
              <div className='flex gap-5'>
                <p>
                  <b>Title</b>:
                </p>
                <p>{movie.title}</p>
              </div>

              <span>
                <b>Genres</b> :{" "}
              </span>
              <div className='genres mt-4'>
                {movie.genres.map((genre) => {
                  return <span key={genre.id}>{genre.name}</span>;
                })}
              </div>
              <div className='flex gap-5'>
                <p>
                  <b>Status</b> :{" "}
                </p>
                <p>
                  {movie.status}{" "}
                  {movie.status === "Released" ? `(${movie.release_date})` : ""}
                </p>
              </div>
            </div>
            <div className='plain-card border-0 w-full sm:h-128 text-left overflow-hidden'>
              {movieVideos && (
                <div className='trailer w-full h-full'>
                  <iframe
                    className='w-full h-full'
                    src={`https://www.youtube.com/embed/${movieVideos[0].key}`}
                    title='YouTube video player'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
          <div className='view-more-header ml-6 md:m-auto lg:m-auto'>
            <h2>View More</h2>
          </div>
          <div className='images-section'>{movieImages && imagesSection}</div>
          <div className='cast-section'>{movieCast && castSection}</div>
          <div className='production-section'>
            {movie && productionCompanies}
          </div>
          <div className='card p-4 comment-section w-full text-left mt-36 mb-52 mx-auto md:w-4/5 sm:w-full '>
            <h2 className='bk-text-colour'>Comments</h2>
            <div className='comments'>
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div className='card border-default mb-2 p-3'>
                    <div className='flex flex-col border-none px-6 py-2 w-full justify-between md:w-fit md:justify-start rounded-md '>
                      <span className='leading-4'>{comment.username}</span>
                      <div className='flex flex-row'>
                        <span className='opacity-25 mr-2'>
                          rated {comment.rating} / 5
                        </span>
                        <img
                          className='w-4 my-auto'
                          src={starImg}
                          alt='star_img'
                        />
                      </div>
                      <p className='leading-7 mt-2'>{comment.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-slate-500'>
                  No comments yet for this movie...
                </div>
              )}
            </div>
            <div
              className='p-px'
              style={
                colours
                  ? {
                      background: `linear-gradient(90deg,rgba(0,0,0,0),${colours[0]}, ${colours[1]}, ${colours[2]}, rgba(0,0,0,0))`,
                    }
                  : {}
              }
            ></div>
            <div>
              <div className='my-2'>
                <div className='rating'>
                  <span className='bk-text-colour mr-2 text-lg md:text-sm'>
                    Rate Movie :
                  </span>
                  <Rating
                    className='text-xl md:text-sm'
                    initialRating={rating}
                    onClick={(val) => {
                      setMovieRating(val);
                    }}
                    emptySymbol={<BiStar />}
                    fullSymbol={<FaStar />}
                  />
                </div>
              </div>
              <div className='controls flex my-2 gap-2 flex-col md:flex-row '>
                <input
                  onKeyDown={(e) => {
                    if (e.code === 'Enter') {
                      onSubmit();
                    }
                  }}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  value={text}
                  type='text'
                  id='comment'
                  className=' bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-200 focus:border-blue-100 block w-full p-2.5'
                  placeholder='Add your thoughts about the movie...'
                  required
                ></input>
                <button
                  onClick={() => {
                    onSubmit();
                  }}
                  type='button'
                  className='text-black focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-2.5 text-center'
                >
                  Send
                </button>
              </div>
              <p className='text-sm text-rose-500 pt-1 pl-2'>{commentErr}</p>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Movie;
