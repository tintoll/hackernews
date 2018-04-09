import React, { Component } from 'react';
import './App.css';


const DEFAULT_HPP = '100';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage='
const isSearched = searchTerm => 
      item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props) {
    super(props);
    // 객체 초기화 
    // list : list
    this.state = {
      results : null,
      searchKey : '',
      searchTerm : DEFAULT_QUERY
    }
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  } 
  setSearchTopStories(result) {
    const {hits, page} = result;
    const {searchKey, results} = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey] : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({
      results : {
        ...results,
        [searchKey] : {hits : updatedHits, page}
      }
    });
  }
  fetchSearchTopStories(searchTerm, page = 0) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => {
        return this.setSearchTopStories(result)
      })
      .catch(error => error);
  }
  componentDidMount() {
    const { searchTerm } = this.state;
    // 캐시내 현재 결과를 가리키는 포인터 역할 
    this.setState({
      searchKey : searchTerm
    });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {

    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];
    
    const isNotId = item => item.objectID !== id; 
    const updatedHits = hits.filter(isNotId);
    //  hits기사만 업데이트 하기 위해서 Object.assign을 사용 
    // Object.assign()을 전개연산자로 대체할수있음.
    this.setState({
      // result: Object.assign({}, this.state.result, {hists:updatedHits})
      results : {
        ...results, 
        [searchKey]:{hits:updatedHits, page}}
    });
  }
  onSearchChange(event) {
    this.setState({
      searchTerm : event.target.value
    });
  }
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({
      searchKey: searchTerm
    });
    if(this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    } 
    event.preventDefault();
  }

  render() {
    const { searchTerm, results, searchKey } = this.state;

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
          
          <Table
            list={list}
            onDismiss={this.onDismiss} />
          
          <div className="interactions">
            <Button onClick={()=> this.fetchSearchTopStories(searchKey, page+1)}>
              More
            </Button>
          </div>
          
        </div>
      </div>
    );
  }
}

const Search = ({ value, onSubmit, onChange, children }) => {
  return (
    <form onSubmit={onSubmit}>
      <input type="text"
        value={value}
        onChange={onChange} />
      <button type="submit">{children}</button>  
    </form>
  )
}
const Table = ({ list, onDismiss }) => {
  return (
    <div className="table">
      {list.map(item =>
        <div key={item.objectID} className="table-row">
          <span style={{ width: '40%' }}><a href={item.url}>{item.title}</a></span>
          <span style={{ width: '30%' }}>{item.author}</span>
          <span style={{ width: '10%' }}>{item.num_comments}</span>
          <span style={{ width: '10%' }}>{item.points}</span>
          <span style={{ width: '10%' }}>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline">
              Dismiss
              </Button>
          </span>   
        </div>
      )}
    </div>
  )
}

const Button = ({ onClick, className = '',children }) => {
  return (
    <button onClick={onClick}
      className={className}
      type="button">
      {children}
    </button>
  )
}

export default App;
