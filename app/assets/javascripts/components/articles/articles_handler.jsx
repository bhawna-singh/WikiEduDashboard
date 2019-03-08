import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';

import ArticleList from './article_list.jsx';
import AssignmentList from '../assignments/assignment_list.jsx';
import AvailableArticles from '../articles/available_articles.jsx';
import CourseOresPlot from './course_ores_plot.jsx';
import CategoryHandler from '../categories/category_handler.jsx';
import { fetchArticles, sortArticles, filterArticles, filterNewness } from '../../actions/articles_actions.js';
import { fetchAssignments } from '../../actions/assignment_actions';
import { getArticlesByNewness } from '../../selectors';

export const ArticlesHandler = createReactClass({
  displayName: 'ArticlesHandler',

  propTypes: {
    course_id: PropTypes.string,
    current_user: PropTypes.object,
    course: PropTypes.object,
    fetchArticles: PropTypes.func,
    limitReached: PropTypes.bool,
    limit: PropTypes.number,
    articles: PropTypes.array,
    loadingArticles: PropTypes.bool,
    assignments: PropTypes.array,
    loadingAssignments: PropTypes.bool
  },

  getInitialState() {
    return {
      showArticlesEdited: true,
      showAssignedArticles: false,
      showAvailableArticles: false
    };
  },

  componentWillMount() {
    if (this.props.loadingAssignments) {
      this.props.fetchAssignments(this.props.course_id);
    }
    if (this.props.loadingArticles) {
      this.props.fetchArticles(this.props.course_id, this.props.limit);
    }
  },

  onChangeFilter(e) {
    const value = e.target.value.split('.');
    if (value.length > 1) {
      return this.props.filterArticles({ language: value[0], project: value[1] });
    }
    return this.props.filterArticles({ language: null, project: value[0] });
  },

  onNewnessChange(e) {
    return this.props.filterNewness(e.target.value);
  },

  toggleSection(key) {
    const state = {
      showArticlesEdited: false,
      showAssignedArticles: false,
      showAvailableArticles: false
    };

    this.setState({ ...state, [key]: true });
  },

  showMore() {
    return this.props.fetchArticles(this.props.course_id, this.props.limit + 500);
  },

  sortSelect(e) {
    return this.props.sortArticles(e.target.value);
  },

  render() {
    // FIXME: These props should be required, and this component should not be
    // mounted in the first place if they are not available.
    if (!this.props.course || !this.props.course.home_wiki) { return <div />; }

    let categories;
    if (this.props.course.type === 'ArticleScopedProgram') {
      categories = <CategoryHandler course={this.props.course} current_user={this.props.current_user} />;
    }

    // The following is all for the "Articles Edited" section
    let header;
    if (Features.wikiEd) {
      header = <h3 className="article tooltip-trigger">{I18n.t('metrics.articles_edited')}</h3>;
    } else {
      header = (
        <h3 className="article tooltip-trigger">{I18n.t('metrics.articles_edited')}
          <span className="tooltip-indicator" />
          <div className="tooltip dark">
            <p>{I18n.t('articles.cross_wiki_tracking')}</p>
          </div>
        </h3>
      );
    }

    let filterWikis;
    if (this.props.wikis.length > 1) {
      const wikiOptions = this.props.wikis.map((wiki) => {
        const wikiString = `${wiki.language ? `${wiki.language}.` : ''}${wiki.project}`;
        return (<option value={wikiString} key={wikiString}>{wikiString}</option>);
      });

      filterWikis = (
        <select onChange={this.onChangeFilter}>
          <option value="all">{I18n.t('articles.filter.wiki_all')}</option>
          {wikiOptions}
        </select>
      );
    }

    let filterArticlesSelect;
    if (this.props.newnessFilterEnabled) {
      filterArticlesSelect = (
        <select className="filter-articles" defaultValue="both" onChange={this.onNewnessChange}>
          <option value="new">{I18n.t('articles.filter.new')}</option>
          <option value="existing">{I18n.t('articles.filter.existing')}</option>
          <option value="both">{I18n.t('articles.filter.new_and_existing')}</option>
        </select>
      );
    }

    let filterLabel;
    if (!!filterWikis || !!filterArticlesSelect) {
      filterLabel = <b>Filters:</b>;
    }

    const articleSort = (
      <div className="article-sort">
        <select className="sorts" name="sorts" onChange={this.sortSelect}>
          <option value="rating_num">{I18n.t('articles.rating')}</option>
          <option value="title">{I18n.t('articles.title')}</option>
          <option value="character_sum">{I18n.t('metrics.char_added')}</option>
          <option value="view_count">{I18n.t('metrics.view')}</option>
        </select>
      </div>
    );

    const sectionHeader = (
      <div className="section-header">
        {header}
        <CourseOresPlot course={this.props.course} />
        <div className="wrap-filters">
          {filterLabel}
          {filterArticlesSelect}
          {filterWikis}
          {articleSort}
        </div>
      </div>
    );

    let showMoreButton;
    if (!this.props.limitReached) {
      showMoreButton = <div><button className="button ghost stacked right" onClick={this.showMore}>{I18n.t('articles.see_more')}</button></div>;
    }

    return (
      <div className="articles-view">
        <nav>
          <ul>
            <li>
              <button
                className={`button ${this.state.showArticlesEdited ? 'active' : ''}`}
                onClick={() => this.toggleSection('showArticlesEdited')}
              >
                Articles Edited
              </button>
            </li>
            <li>
              <button
                className={`button ${this.state.showAssignedArticles ? 'active' : ''}`}
                onClick={() => this.toggleSection('showAssignedArticles')}
              >
                Assigned Articles
              </button>
            </li>
            <li>
              <button
                className={`button ${this.state.showAvailableArticles ? 'active' : ''}`}
                onClick={() => this.toggleSection('showAvailableArticles')}
              >
                Available Articles
              </button>
            </li>
          </ul>
        </nav>

        {
          this.state.showArticlesEdited && (
            <div id="articles" className="mt4">
              {sectionHeader}
              <ArticleList {...this.props} articles={this.props.articles} sortBy={this.props.sortArticles} />
              {showMoreButton}
            </div>
          )
        }

        {
          this.state.showAssignedArticles && (
            <div id="assignments" className="mt4">
              <div className="section-header">
                <h3>{I18n.t('articles.assigned')}</h3>
              </div>
              <AssignmentList {...this.props} />
            </div>
          )
        }

        {
          this.state.showAvailableArticles && (
            <AvailableArticles {...this.props} />
          )
        }

        {categories}
      </div>
    );
  }
});

const mapStateToProps = state => ({
  limit: state.articles.limit,
  articles: getArticlesByNewness(state),
  limitReached: state.articles.limitReached,
  wikis: state.articles.wikis,
  wikidataLabels: state.wikidataLabels.labels,
  loadingArticles: state.articles.loading,
  assignments: state.assignments.assignments,
  loadingAssignments: state.assignments.loading,
  newnessFilterEnabled: state.articles.newnessFilterEnabled
});

const mapDispatchToProps = {
  fetchArticles,
  sortArticles,
  filterArticles,
  filterNewness,
  fetchAssignments
};

export default connect(mapStateToProps, mapDispatchToProps)(ArticlesHandler);
