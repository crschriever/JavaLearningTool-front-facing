import React from "react";

// Used to map difficulty value to a String
const diff = ["Very easy", "Easy", "Intermediate", "Advanced", "Challenging"];

class Challenge extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            challenges: props.challenges,
            categories: props.categories,
            shown: props.shown,
            categorySelected: -1
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
            this.setState({
                challenges: nextProps.challenges,
                categories: nextProps.categories,
                shown: nextProps.shown
            });
        }
    }

    render() {
        let challenges = [];
        let categories = [];
        let selectedCategory = this.state.categories[this.state.categorySelected];

        // Create challenges contents. Filter out challenges based on which category is selected
        this.state.challenges.forEach((challenge, index) => {
            if (selectedCategory !== undefined) {
                let foundCat = false;
                challenge.categories.forEach(category => {
                    if (category === selectedCategory._id) {
                        foundCat = true;
                    }
                });

                // Skip this challenge if it doesn't fall under the selected category
                if (!foundCat) {
                    return;
                }
            }

            // If the challenge falls under selected category go ahead and add it to be rendered
            challenges.push(
                <li className="categoryLI" key={index}>
                    <a href={"/admin/challenge/" + challenge._id}>
                        <div className="admin-row flat card">
                            <div className="title">{challenge.name}</div>
                            <div className="description">{challenge.description}</div>
                            <div className="difficulty">
                                Difficulty: {diff[challenge.difficulty - 1]}
                            </div>
                        </div>
                    </a>
                </li>
            );
        });

        const categoryAdder = (category, index) => {
            categories.push(
                <li className="pure-menu-item" key={index}>
                    <div
                        className="category-dropdown-item"
                        onClick={() => this.categoryClicked(index)}
                    >
                        {category.title}
                    </div>
                </li>
            );
        };

        categoryAdder({ title: "None", _id: -1 }, -1);

        // Create category drop down contents
        this.state.categories.forEach(categoryAdder);

        return (
            <div className="category-list" style={this.state.shown ? {} : { display: "none" }}>
                <h1>Challenges</h1>
                <a href="/admin/new_challenge">
                    <div className="card new-admin-card">
                        <h2>Add Challenge</h2>
                    </div>
                </a>
                <div className="pure-menu pure-menu-horizontal criteria-menu">
                    <ul className="pure-menu-list">
                        <li className="pure-menu-item pure-menu-has-children pure-menu-allow-hover criteria-dropdown">
                            <span className="pure-menu-link header">
                                {this.state.categorySelected === -1
                                    ? "Category"
                                    : this.state.categories[this.state.categorySelected].title}
                            </span>
                            <ul className="pure-menu-children">{categories}</ul>
                        </li>
                    </ul>
                </div>
                <ul className="admin-categories admin-table">{challenges}</ul>
            </div>
        );
    }

    /**
     * Called whenever a category is selected from the drop down
     *
     * @param {Number} index
     */
    categoryClicked(index) {
        if (this.state.categories[index] === undefined) {
            index = -1;
        }

        this.setState({
            categorySelected: index
        });
    }
}

export default Challenge;
