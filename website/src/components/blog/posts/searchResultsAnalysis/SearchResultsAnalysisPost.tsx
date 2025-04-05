import styled from 'styled-components';

import {getNumberWithCommas, getWikipediaPageUrl} from '../../../../utils';
import {BarChart} from '../../../charts/BarChart';
import {Table} from '../../../charts/Table';
import {StyledTextLink} from '../../../common/StyledTextLink';
import {NewsletterSignupForm} from '../../NewsletterSignupForm';
import * as data from './data';
import elevenDegreesOfSeparationSearchImage from './elevenDegreesOfSeparationSearch.png';

const TITLE = 'Insights On Hitler And More From The First 500,000 Searches';

const Wrapper = styled.div`
  max-width: 740px;
  padding: 4px 20px;
  margin: 20px auto;
  background-color: ${({theme}) => theme.colors.creme};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};

  @media (max-width: 600px) {
    padding: 2px 16px;
    margin-bottom: 0;
    border: none;
    border-top: solid 3px ${({theme}) => theme.colors.darkGreen};
  }
`;

const Title = styled.h1`
  margin: 20px auto;
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  font-family: 'Quicksand', serif;
  color: ${({theme}) => theme.colors.red};
`;

const Subtitle = styled.p`
  text-align: center;
  margin: 20px auto;
  font-size: 20px;
  font-family: 'Quicksand', serif;
  color: ${({theme}) => theme.colors.darkGreen};
`;

const SectionTitle = styled.h2`
  margin: 20px auto;
  font-size: 28px;
  font-weight: bold;
  font-family: 'Quicksand', serif;
  color: ${({theme}) => theme.colors.red};
`;

const P = styled.p`
  margin: 20px auto;
  font-size: 20px;
  line-height: 1.5;
  font-family: 'Quicksand', serif;
  text-align: justify;
  color: ${({theme}) => theme.colors.darkGreen};
`;

const Image = styled.img`
  display: block;
  width: 100%;
`;

const StatsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: -10px 0;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(50% - 12px);
  margin: 10px 0;
  text-align: center;
  background-color: ${({theme}) => theme.colors.creme};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};

  p:first-of-type {
    background-color: ${({theme}) => theme.colors.darkGreen};
    padding: 12px;
    font-size: 20px;
    font-weight: bold;
    color: ${({theme}) => theme.colors.creme};
  }

  p:last-of-type {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    padding: 8px;
    font-size: 32px;
    font-weight: bold;
    color: ${({theme}) => theme.colors.darkGreen};
  }

  a {
    max-width: 90%;
    font-size: 28px;
    margin: 12px auto 4px auto;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const Divider = styled.div`
  border-top: solid 1px ${({theme}) => theme.colors.darkGreen};
  margin: 20px auto;

  &::after {
    content: '';
  }
`;

export const SearchResultsAnalysisPost = () => (
  <Wrapper>
    <title>{`${TITLE} | Blog | Six Degrees of Wikipedia`}</title>

    <Title>{TITLE}</Title>
    <Subtitle>
      <StyledTextLink text="Jacob Wenger" href="https://jwn.gr" /> | March 14, 2018
    </Subtitle>

    <P>
      A little over two weeks ago, I released{' '}
      <StyledTextLink text="Six Degrees of Wikipedia" href="/" />, a website which allows you to
      find the shortest hyperlinked paths between any two pages on the world's largest free online
      encyclopedia. This morning, it surpassed 500,000 searches! With that decent sample size, I
      dove into the data and found some interesting &mdash; and sometimes comical &mdash; insights.
    </P>

    <SectionTitle>Most Popular Searches</SectionTitle>

    <P>
      Despite Wikipedia comprising almost six million pages, only{' '}
      <b>{data.percentUniqueSearches}%</b> of the searches have been unique, meaning one out of
      every four searches is for something that has already been searched:
    </P>

    <StatsWrapper>
      <Stat>
        <p>Total Searches</p>
        <p>{getNumberWithCommas(data.totalSearches)}</p>
      </Stat>

      <Stat>
        <p>Unique Searches</p>
        <p>{getNumberWithCommas(data.uniqueSearches)}</p>
      </Stat>
    </StatsWrapper>

    <P>
      The main reason for this is that some searches were <i>really</i> popular. Each of the top
      searches can be traced back to an online forum or website where someone posted a search they
      thought was funny or intriguing, leading others to click the link and try it themselves. Here
      are the top ten by search count, including the source where each was shared:
    </P>

    <Table
      headers={data.mostPopularSearchesHeaders}
      rows={data.mostPopularSearches.map((searchInfo) => {
        const searchUrl = `/?source=${encodeURIComponent(
          searchInfo.sourcePageTitle
        )}&target=${encodeURIComponent(searchInfo.targetPageTitle)}`;
        const searchLink = (
          <StyledTextLink
            text={`${searchInfo.sourcePageTitle} → ${searchInfo.targetPageTitle}`}
            href={searchUrl}
          />
        );
        const referenceLink = (
          <StyledTextLink text={searchInfo.referenceText} href={searchInfo.referenceUrl} />
        );
        return [
          searchLink,
          searchInfo.degreesOfSeparation === null
            ? 'No path'
            : searchInfo.degreesOfSeparation.toString(),
          getNumberWithCommas(searchInfo.numberOfSearches),
          referenceLink,
        ];
      })}
    />

    <P>
      The ability to share searches via URLs was a last-minute feature added the day before
      releasing the project. These numbers make me glad I added it.
    </P>

    <SectionTitle>Most Popular Pages</SectionTitle>

    <P>
      Filtering out duplicates and looking at the total count of searches which include a page as
      either the start or end of the search, the following pages were most popular:
    </P>

    <Table
      headers={data.mostPopularPagesHeaders}
      rows={data.mostPopularPages.map((pageInfo) => {
        const link = (
          <StyledTextLink
            text={pageInfo.pageTitle}
            href={getWikipediaPageUrl(pageInfo.pageTitle)}
          />
        );
        return [link, getNumberWithCommas(pageInfo.numberOfSearches)];
      })}
    />

    <P>
      Quite a lineup right there! Hitler runs away with the top spot, which is not too surprising
      because internet and because of the somewhat popular{' '}
      <StyledTextLink
        text="Clicks to Hitler"
        href="https://en.wikipedia.org/wiki/Wikipedia:Wiki_Game#Variations"
      />{' '}
      game in which you try to navigate to Hitler's Wikipedia page from other Wikipedia pages. On a
      related note, my apologies to the{' '}
      <StyledTextLink text="r/degreestohitler" href="https://www.reddit.com/r/degreestohitler/" />{' '}
      subreddit for possibly spoiling all their fun.
    </P>

    <P>
      After Hitler, you've got the last two United States Presidents, the son of God (to many),
      Kevin Bacon of{' '}
      <StyledTextLink
        text="Six Degrees of Kevin Bacon"
        href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon"
      />{' '}
      fame, another{' '}
      <StyledTextLink
        text="Wikipedia game variant"
        href="https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy"
      />
      , some favorite topics from Hacker News, and... an experimental hip hop group from Sacramento
      called <StyledTextLink text="Death Grips" href="https://en.wikipedia.org/wiki/Death_Grips" />.
      That last one caught me by surprise. After some online searching, all I could come up with to
      explain it was an r/deathgrips thread from last month called{' '}
      <StyledTextLink
        text="Six Degrees of Death Grips"
        href="https://www.reddit.com/r/deathgrips/comments/7q9l51/six_degrees_of_death_grips/"
      />
      . If you have any more information to explain this, please let me know.
    </P>

    <SectionTitle>Average Degrees of Separation</SectionTitle>

    <P>
      People seem to be consistently surprised about how few clicks it takes to get from one
      Wikipedia page to another. It actually takes some time and effort to find pages which are
      separated by four or more degrees. Across all unique searches, here is the average degrees of
      separation:
    </P>

    <StatsWrapper>
      <Stat>
        <p>Average Degrees of Separation</p>
        <p>{data.averageDegreesOfSeparation.toFixed(4)}&deg;</p>
      </Stat>
    </StatsWrapper>

    <P>
      <i>
        <b>Note:</b> The average above does not include searches with the same start and end page
        (that is, with zero degrees of separation) nor searches with no path between the start and
        end pages.
      </i>
    </P>

    <P>
      This number is far from scientific and probably does not extrapolate to the entire graph since
      the pages people think to search for are likely more connected than most. I expect if you pick
      any two pages at random, they will on average have more degrees of separation than the number
      above. But this does make me wonder if my my site should more accurately be called{' '}
      <b>Three Degrees of Wikipedia</b>.
    </P>

    <SectionTitle>Most Degrees of Separation</SectionTitle>

    <P>
      Averages can be useful, but it is often much more interesting to look at outliers. And when I
      did, I came across some searches with degrees of separation that were much higher than
      expected. The longest path found to date is{' '}
      <StyledTextLink text="Embleton → McCombie" href="/?source=Embleton&target=McCombie" /> which
      has an incredible <b>11 degrees</b> of separation thanks to a long tail at the end of the
      search path:
    </P>

    <Image
      src={elevenDegreesOfSeparationSearchImage}
      alt="Six Degrees of Wikipedia results graph from 'Embleton' to 'McCombie'"
    />

    <P>
      Looking at a histogram of searches according to their degrees of separation, it becomes clear
      how rare it is for searches to have 6 or more degrees of separation:
    </P>

    <BarChart data={data.degreesOfSeparationHistogramData} />

    <P>
      Big shout out to the {getNumberWithCommas(data.degreesOfSeparationHistogramData[0])} people
      who tried searches with the same start and end pages. Thanks for keeping me honest.
    </P>

    <SectionTitle>Searches With The Most Paths</SectionTitle>

    <P>
      It is not only surprising how few clicks it takes to get from one page to another, but also
      how many different paths you can take to get there. Here are the searches with the most result
      paths for each degree of separation:
    </P>

    <Table
      headers={data.mostPathSearchesHeaders}
      rows={data.mostPathSearches.map((searchInfo) => {
        const searchUrl = `/?source=${encodeURIComponent(
          searchInfo.sourcePageTitle
        )}&target=${encodeURIComponent(searchInfo.targetPageTitle)}`;
        const link = (
          <StyledTextLink
            text={`${searchInfo.sourcePageTitle} → ${searchInfo.targetPageTitle}`}
            href={searchUrl}
          />
        );
        return [
          link,
          searchInfo.degreesOfSeparation,
          getNumberWithCommas(searchInfo.numberOfPaths),
        ];
      })}
    />

    <SectionTitle>Searches With No Paths</SectionTitle>

    <P>
      It turns out you cannot reach every page from any other page. Some pages are dead ends or part
      of their own small islands with few incoming and outgoing links. In fact,{' '}
      <b>{data.percentNoPathsSearches}%</b> of all unique searches have no path from the start to
      end pages:
    </P>

    <StatsWrapper>
      <Stat>
        <p>Searches With No Paths</p>
        <p>{getNumberWithCommas(data.searchesWithNoPaths)}</p>
      </Stat>
    </StatsWrapper>

    <SectionTitle>Server Response Times</SectionTitle>

    <P>
      One of the most difficult parts of making <b>Six Degrees of Wikipedia</b> &mdash; and the one
      that took up a large chunk of my time &mdash; was making it fast. After looking at server
      response times over the past two weeks, I'm really pleased with how quickly results are found.
      Here are some stats:
    </P>

    <StatsWrapper>
      <Stat>
        <p>Average Server Response Time</p>
        <p>{data.averageDuration} s</p>
      </Stat>
      <Stat>
        <p>Median Server Response Time</p>
        <p>{data.medianDuration} s</p>
      </Stat>
      <Stat>
        <p>95th Percentile Server Response Time</p>
        <p>{data.percentile95Duration} s</p>
      </Stat>
      <Stat>
        <p>99th Percentile Server Response Time</p>
        <p>{data.percentile99Duration} s</p>
      </Stat>
    </StatsWrapper>

    <P>
      <i>
        <b>Note:</b> The times above represent time taken on the server and do not include the
        entire response time, which varies depending on the location of the user who made the
        request and their network speed.
      </i>
    </P>

    <P>
      <i>
        <b>Another note:</b> The search itself runs much faster than the times above. Most of the
        time is actually spent querying the Wikipedia API to fetch page information like image URLs
        and descriptions which are not stored in my database.
      </i>
    </P>

    <P>
      Because I was curious, I decided to see what search had the longest response time. The search
      itself has little to do with how long it took to respond. It just happened to be made during a
      time of high traffic in which my server was responding slowly. But, boy oh boy, was I rewarded
      when I discovered what the actual search was:
    </P>

    <StatsWrapper>
      <Stat>
        <p>Longest Response Time</p>
        <StyledTextLink
          text="Penis → Adolf Hitler"
          href="https://www.sixdegreesofwikipedia.com/?source=Penis&target=Adolf%20Hitler"
        />
        <p>38.96 s</p>
      </Stat>
    </StatsWrapper>

    <P>Sometimes you gotta love the internet...</P>

    <SectionTitle>Show Me The SQL</SectionTitle>

    <P>
      For those fellow developers out there who are interested in the SQL queries used to generate
      these stats, you can find them all on{' '}
      <StyledTextLink
        text="this project's GitHub"
        href="https://github.com/jwngr/sdow/tree/main/website/src/components/blog/posts/searchResultsAnalysis/queries.txt"
      />
      . I will likely go into more detail on my server and database setup in a future post.
    </P>

    <SectionTitle>Wrapping Up</SectionTitle>

    <P>
      <StyledTextLink text="Six Degrees of Wikipedia" href="/" /> captured the attention and
      excitement of so many people for the same reasons I decided to build it in the first place: it
      is entertaining to explore the concept and see the unexpected connections between seemingly
      random topics. It is also intriguing to dive into the stats behind the project like we just
      did.
    </P>

    <P>
      Are there other stats you would like to know? Or are there other topics related to the project
      you want to read about? If so, please reach out to me on{' '}
      <StyledTextLink text="Twitter" href="https://twitter.com/_jwngr" /> or{' '}
      <StyledTextLink text="GitHub" href="https://github.com/jwngr/sdow" />.
    </P>

    <Divider />

    <NewsletterSignupForm />
  </Wrapper>
);
