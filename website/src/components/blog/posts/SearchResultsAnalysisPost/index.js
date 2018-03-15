import React from 'react';
import {Helmet} from 'react-helmet';

import Table from '../../../charts/Table';
import BarChart from '../../../charts/BarChart';
import StyledLink from '../../../common/StyledLink';
import NewsletterSignupForm from '../../NewsletterSignupForm';

import {
  P,
  Image,
  Title,
  Divider,
  Subtitle,
  SectionTitle,
  Stat,
  StatsWrapper,
  Wrapper,
} from '../../BlogPost/index.styles';

import {getNumberWithCommas} from '../../../../utils';

import elevenDegreesOfSeparationSearchImage from './elevenDegreesOfSeparationSearch.png';

import * as data from './data';

const title = 'Insights On Hitler And More From The First 500,000 Searches';

export default () => (
  <Wrapper>
    <Helmet>
      <title>{`${title} | Blog | Six Degrees of Wikipedia`}</title>
    </Helmet>

    <Title>{title}</Title>
    <Subtitle>
      <StyledLink href="https://jwn.gr">Jacob Wenger</StyledLink> | March 14, 2018
    </Subtitle>

    <P>
      A little over two weeks ago, I released{' '}
      <StyledLink href="/">Six Degrees of Wikipedia</StyledLink>, a website which allows you to find
      the shortest hyperlinked paths between any two pages on the world's largest free online
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

    <Table headers={data.mostPopularSearchesHeaders} rows={data.mostPopularSearchesRows} />

    <P>
      The ability to share searches via URLs was a last-minute feature added the day before
      releasing the project. These numbers make me glad I added it.
    </P>

    <SectionTitle>Most Popular Pages</SectionTitle>

    <P>
      Filtering out duplicates and looking at the total count of searches which include a page as
      either the start or end of the search, the following pages were most popular:
    </P>

    <Table headers={data.mostPopularPagesHeaders} rows={data.mostPopularPagesRows} />

    <P>
      Quite a lineup right there! Hitler runs away with the top spot, which is not too surprising
      because internet and because of the somewhat popular{' '}
      <StyledLink href="https://en.wikipedia.org/wiki/Wikipedia:Wiki_Game#Variations">
        Clicks to Hitler
      </StyledLink>{' '}
      game in which you try to navigate to Hitler's Wikipedia page from other Wikipedia pages. On a
      related note, my apologies to the{' '}
      <StyledLink href="https://www.reddit.com/r/degreestohitler/">r/degreestohitler</StyledLink>{' '}
      subreddit for possibly spoiling all their fun.
    </P>

    <P>
      After Hitler, you've got the last two United States Presidents, the son of God (to many),
      Kevin Bacon of{' '}
      <StyledLink href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon">
        Six Degrees of Kevin Bacon
      </StyledLink>{' '}
      fame, another{' '}
      <StyledLink href="https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy">
        Wikipedia game variant
      </StyledLink>
      , some favorite topics from Hacker News, and... an experimental hip hop group from Sacramento
      called <StyledLink href="https://en.wikipedia.org/wiki/Death_Grips">Death Grips</StyledLink>.
      That last one caught me by surprise. After some online searching, all I could come up with to
      explain it was an r/deathgrips thread from last month called{' '}
      <StyledLink href="https://www.reddit.com/r/deathgrips/comments/7q9l51/six_degrees_of_death_grips/">
        Six Degrees of Death Grips
      </StyledLink>. If you have any more information to explain this, please let me know.
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
      <StyledLink href="/?source=Embleton&target=McCombie">Embleton → McCombie</StyledLink> which
      has an incredible <b>11 degrees</b> of separation thanks to a long tail at the end of the
      search path:
    </P>

    <Image src={elevenDegreesOfSeparationSearchImage} />

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

    <Table headers={data.mostPathSearchesHeaders} rows={data.mostPathSearchesRow} />

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
        <StyledLink href="https://www.sixdegreesofwikipedia.com/?source=Penis&target=Adolf%20Hitler">
          Penis → Adolf Hitler
        </StyledLink>
        <p>38.96 s</p>
      </Stat>
    </StatsWrapper>

    <P>Sometimes you gotta love the internet...</P>

    <SectionTitle>Show Me The SQL</SectionTitle>

    <P>
      For those fellow developers out there who are interested in the SQL queries used to generate
      these stats, you can find them all on{' '}
      <StyledLink href="https://github.com/jwngr/sdow/tree/master/website/src/components/blog/posts/SearchResultsAnalysisPost/queries.txt">
        this project's GitHub
      </StyledLink>. I will likely go into more detail on my server and database setup in a future
      post.
    </P>

    <SectionTitle>Wrapping Up</SectionTitle>

    <P>
      <StyledLink href="/">Six Degrees of Wikipedia</StyledLink> captured the attention and
      excitement of so many people for the same reasons I decided to build it in the first place: it
      is entertaining to explore the concept and see the unexpected connections between seemingly
      random topics. It is also intriguing to dive into the stats behind the project like we just
      did.
    </P>

    <P>
      Are there other stats you would like to know? Or are there other topics related to the project
      you want to read about? If so, please reach out to me on{' '}
      <StyledLink href="https://twitter.com/_jwngr">Twitter</StyledLink> or{' '}
      <StyledLink href="https://github.com/jwngr/sdow">GitHub</StyledLink>.
    </P>

    <Divider />

    <NewsletterSignupForm />
  </Wrapper>
);
