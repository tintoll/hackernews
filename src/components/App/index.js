import React, { Component } from 'react';
import axios from 'axios';

// import fetch from 'isomorphic-fetch';
import './index.css';
import {
  DEFAULT_HPP,
  DEFAULT_QUERY,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
} from '../../constants';
import Table from '../Table';
import Button from '../Button';
import Search from '../Search';
import Loading from '../Loading';



// const isSearched = searchTerm => 
//     item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

const withLoading = (Component) => ({isLoading, ...rest}) => {
  return isLoading ? <Loading /> : <Component { ...rest} />
}
const ButtonWithLoading = withLoading(Button);

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    // 객체 초기화 
    // list : list
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading : false,
      sortKey : 'NONE',
      isSortReverse : false,
    }
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({sortKey, isSortReverse});
  }
  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }
  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading : false
    });
  }
  fetchSearchTopStories(searchTerm, page = 0) {
    /* // fetch api 사용
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => {
        return this.setSearchTopStories(result)
      })
      .catch(error => this.setState({error}));
     */
    this.setState({isLoading: true});
    // axios 사용 
    axios.get(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => {
        return this._isMounted && this.setSearchTopStories(result.data)
      })
      .catch(error => this._isMounted && this.setState({ error }));
  }
  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    // 캐시내 현재 결과를 가리키는 포인터 역할 
    this.setState({
      searchKey: searchTerm
    });
    this.fetchSearchTopStories(searchTerm);
  }
  componentWillMount() {
    this._isMounted = false;
  }

  onDismiss(id) {

    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    //  hits기사만 업데이트 하기 위해서 Object.assign을 사용 
    // Object.assign()을 전개연산자로 대체할수있음.
    this.setState({
      // result: Object.assign({}, this.state.result, {hists:updatedHits})
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }
  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value
    });
  }
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({
      searchKey: searchTerm
    });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  render() {
    const { searchTerm, results, 
            searchKey, error, 
            isLoading, sortKey, isSortReverse} = this.state;

    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    // if(!result) {return null;}

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}>
            Search
          </Search>
          {
            error ?
              <div className="interactions">
                <p>Something went wrong.</p>
              </div>
              :
              <Table
                list={list}
                sortKey={sortKey}
                isSortReverse={isSortReverse}
                onSort={this.onSort}
                onDismiss={this.onDismiss} />
          }


          <div className="interactions">
            
            <ButtonWithLoading 
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
              More
            </ButtonWithLoading>
            
            
          </div>

        </div>
      </div>
    );
  }
}




export default App;
