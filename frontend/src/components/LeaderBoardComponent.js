import * as React from 'react';
import GameApiClient from '../services/GameApiClient';
import ChallengesApiClient from '../services/ChallengesApiClient';

const LeaderBoardComponent = (props)=> {
    const [leaderboard,setLeaderBoard] = React.useState([])
    const [serverError,setServerError] = React.useState([]) 

    React.useEffect(()=>{
        setInterval(refreshLeaderBoard(),5000)
    },[])


    const getLeaderBoardData = () => {
        return GameApiClient.leaderBoard().then(
            lbRes => {
                if (lbRes.ok) {
                    return lbRes.json();
                } else {
                    return Promise.reject("Gamification: error response");
                }
            }
        );
    }

    const getUserAliasData = (userIds) => {
        return ChallengesApiClient.getUsers(userIds).then(
            usRes => {
                if(usRes.ok) {
                    return usRes.json();
                } else {
                    return Promise.reject("Multiplication: error response");
                }
            }
        )
    }

    const updateLeaderBoard = (lb) => {
        setLeaderBoard(lb)
        setServerError(false)
    }

    const refreshLeaderBoard = () => {
        getLeaderBoardData().then(
            lbData => {
                let userIds = lbData.map(row => row.userId);
                if(userIds.length > 0) {
                    getUserAliasData(userIds).then(data => {
                        let userMap = new Map();
                        data.forEach(idAlias => {
                            userMap.set(idAlias.id, idAlias.alias);
                        });
                        lbData.forEach(row =>
                            row['alias'] = userMap.get(row.userId)
                        );
                        updateLeaderBoard(lbData);
                    }).catch(reason => {
                        console.log('Error mapping user ids', reason);
                        updateLeaderBoard(lbData);
                    });
                }
            }
        ).catch(reason => {
            setServerError(true)
            console.log('Gamification server error', reason);
        });
    }

        return serverError?  (
            <div>We're sorry, but we can't display game statistics at this
                moment.</div>
        ): (
            <div>
                <h3>Leaderboard</h3>
                <table>
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Score</th>
                        <th>Badges</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaderboard.map(row => <tr key={row.userId}>
                        <td>{row.alias ? row.alias : row.userId}</td>
                        <td>{row.totalScore}</td>
                        <td>{row.badges.map(
                            b => <span className="badge" key={b}>{b}</span>)}
                        </td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
        );
    
}

export default LeaderBoardComponent;
