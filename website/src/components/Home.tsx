import React, {useState} from 'react';
import ErrorMessageContainer from '../containers/ErrorMessageContainer';
import LoadingContainer from '../containers/LoadingContainer';
import ResultsContainer from '../containers/ResultsContainer';
import SearchButtonContainer from '../containers/SearchButtonContainer';
import SourcePageInputContainer from '../containers/SourcePageInputContainer';
import SwapInputValuesButton from '../containers/SwapInputValuesButton';
import TargetPageInputContainer from '../containers/TargetPageInputContainer';
import Logo from './common/Logo';
import {InputFlexContainer, Modal, P} from './Home.styles.ts';
import NavLinks from './NavLinks.js';

export const Home: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      <Logo />

      <NavLinks handleOpenModal={handleOpenModal} />

      <Modal isOpen={showModal} onRequestClose={handleCloseModal}>
        <p>
          Inspired by the concept of{' '}
          <a href="https://en.wikipedia.org/wiki/Six_degrees_of_separation">
            six degrees of separation
          </a>
          , <b>Six Degrees of Wikipedia</b> traverses hyperlinks on Wikipedia to find the least
          number of clicks it takes to navigate between any of the nearly six million pages on the
          world's largest free online encyclopedia.
        </p>
        <p>
          Enter the titles of two Wikipedia pages in the boxes on this site, click the "Go!" button,
          and discover just how connected Wikipedia really is.
        </p>
        <p>
          Wikipedia is a registered trademark of the Wikimedia Foundation. This site is made by a
          fan with no affiliation to that organization.
        </p>
        <p>
          A project by <a href="https://jwn.gr/">Jacob Wenger</a>.
        </p>
      </Modal>

      <P>Find the shortest paths from</P>
      <InputFlexContainer>
        <SourcePageInputContainer />
        <SwapInputValuesButton />
        <TargetPageInputContainer />
      </InputFlexContainer>

      <SearchButtonContainer />
      <LoadingContainer />
      <ResultsContainer />
      <ErrorMessageContainer />
    </div>
  );
};
