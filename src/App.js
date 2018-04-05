import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

const list = [
  {
    title : 'React',
    url : 'https://reactjs.org',
    author : 'Jordan walke',
    num_comments : 3,
    points : 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
]
const isSearched = searchTerm => 
      item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props) {
    super(props);
    // 객체 초기화 
    // list : list
    this.state = {
      result : null,
      searchTerm : DEFAULT_QUERY
    }
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }
  setSearchTopStories(result) {
    this.setState({result});
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id; 
    const updatedList = this.state.list.filter(isNotId);
    this.setState({
      list : updatedList
    });
  }
  onSearchChange(event) {
    this.setState({
      searchTerm : event.target.value
    });
  }

  render() {
    const { searchTerm, result } = this.state;
    if(!result) {return null;}
    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value={searchTerm}
            onChange={this.onSearchChange}>
            Search
          </Search>
          <Table 
            list={result.hits}
            pattern={searchTerm}
            onDismiss={this.onDismiss}/>
        </div>
      </div>
    );
  }
}

const Search = ({ value, onChange, children }) => {
  return (
    <form>
      {children}
      <input type="text"
        value={value}
        onChange={onChange} />
    </form>
  )
}
const Table = ({ list, pattern, onDismiss }) => {
  return (
    <div className="table">
      {list.filter(isSearched(pattern)).map(item =>
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
