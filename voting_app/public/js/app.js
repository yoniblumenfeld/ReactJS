

class ProductList extends React.Component{
    constructor(props){ //using props here for the purpose of good habits. isn't really necessary.
        super(props);

    }
    state={products:[],};
    componentDidMount(){
        //a method that's called upon component's loading to page
        //initializing components state from seed.js
        this.setState({products:Seed.products});
    }

    handleProductUpVote = (productId)=>
        {
            const nextProducts = this.state.products.map((product)=>{
                if(product.id == productId){
                    return Object.assign({},product,{
                        votes:product.votes+1
                    });
                }
                else
                    return product;
            });
            this.setState({products:nextProducts});
        };

    render() {
        const products = this.state.products.sort((a,b)=> (a.votes<b.votes));
        const productComponents =products.map((product)=>(
            <Product
                key = {'product-'+product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                url={product.url}
                votes={product.votes}
                submitterAvatarUrl={product.submitterAvatarUrl}
                productImageUrl={product.productImageUrl}
                onVote={this.handleProductUpVote}
            />));
        return (
            <div className="ui unstackable items">
                {productComponents}
            </div>
        )
    }
}
class Product extends React.Component{
    constructor(props){
        super(props);
    }
    handleUpVote =()=>{this.props.onVote(this.props.id)}; //cancels the need of this binding in the constructor method

    render(){
        return (
          <div className="item">
              <div className="image">
                  <img src={this.props.productImageUrl}/>
              </div>
              <div className="middle aligned content">
                  <div className="header">
                      <a onClick={this.handleUpVote}>
                          <i className="large caret up icon"/>
                      </a>
                      {this.props.votes}
                  </div>
                  <div className="description">
                      <a href={this.props.url}>
                          {this.props.title}
                      </a>
                      <p>{this.props.description}</p>
                  </div>
                  <div className="extra">
                      <span>Submitted by:</span>
                      <img className="ui avatar image" src={this.props.submitterAvatarUrl}/>
                  </div>
              </div>
          </div>
        );
    }
}
ReactDOM.render(<ProductList />,document.getElementById("content"));