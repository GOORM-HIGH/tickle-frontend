import React from 'react';
import Layout from '../../../components/layout/Layout';
import SearchResults from '../../components/search/SearchResults';

const SearchPage: React.FC = () => {
  return (
    <Layout>
      <SearchResults />
    </Layout>
  );
};

export default SearchPage;