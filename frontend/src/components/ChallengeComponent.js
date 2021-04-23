import * as React from "react";
import ChallengesApiClient from "../services/ChallengesApiClient";
import LastAttemptsComponent from './LastAttemptsComponent';
import LeaderBoardComponent from './LeaderBoardComponent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const ChallengeComponent = (props)=>{

    const [a,setA] = React.useState('')
    const [b,setB] = React.useState('')
    const [user,setUser] = React.useState('')
    const [message,setMessage] = React.useState('')
    const [guess,setGuess] = React.useState(0)
    const [lastAttempts,setLastAttempts] = React.useState([])

    React.useEffect(()=>{
        refreshChallenge();
    },[])

    const refreshChallenge = () => {
        ChallengesApiClient.challenge().then(
            res => {
                if (res.ok) {
                    res.json().then(json => {
                        setA(json.factorA)
                        setB(json.factorB)
                    });
                } else {
                    setMessage("Can't reach the server");
                }
            }
        );
    }


    const onUserChange = (event) => {
        setUser(event.target.value)
    }
    const onGuessChange = (event) => {
        setGuess(event.target.value)
    }
    const handleSubmitResult = (event) =>{
        event.preventDefault();
        ChallengesApiClient.sendGuess(user,
            a, b,guess)
            .then(res => {
                if (res.ok) {
                    res.json().then(json => {
                        if (json.correct) {
                            setMessage("Congratulations! Your guess is correct");
                        } else {
                            setMessage("Oops! Your guess " + json.resultAttempt +
                                " is wrong, but keep playing!");
                        }
                        updateLastAttempts(user);
                        refreshChallenge();
                    });
                } else {
                    setMessage("Error: server error or not available");
                }
            });
    }

    const updateLastAttempts = (userAlias) => {
        ChallengesApiClient.getAttempts(userAlias).then(res => {
            if (res.ok) {
                let attempts = [];
                res.json().then(data => {
                    data.forEach(item => {
                        attempts.push(item);
                    });
                    setLastAttempts(attempts)
                })
            }
        })
    }

    return (
        <div className="display-column">
            <div>
                <h3>Your new challenge is</h3>
                <div className="challenge">
                    {a} x {b}
                </div>
            </div>
            <form onSubmit={handleSubmitResult}>
            <TextField id="standard-basic" label="Your alias:" name="user" value={user} onChange={onUserChange}/>

                <br/>
                <TextField id="standard-basic" label="Your guess:" type="number" min={0} name="guess" value={guess} onChange={onGuessChange}/>

                <br/>
                <Button style={{marginTop:20}} type="submit" color="primary" variant="contained">
                    Submit
                </Button>
            </form>
            <h4>{message}</h4>
            {lastAttempts.length > 0 &&
                <LastAttemptsComponent lastAttempts={lastAttempts}/>
            }
            <LeaderBoardComponent/>
        </div>
    );
}
export default ChallengeComponent;
