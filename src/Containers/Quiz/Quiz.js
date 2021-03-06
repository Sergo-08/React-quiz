import React, {Component} from 'react';
import classes from './Quiz.module.scss';
import AciveQuiz from "../../Component/ActiveQuiz/ActiveQuiz";
import FinishedQuiz from "../../Component/FinishedQuiz/FinishedQuiz";
import axios from '../../axios/axios-quiz';
import Loader from "../../Component/UI/Loader/Loader";

class Quiz extends Component {
    state = {
        results: {},
        isFinished: false,
        activeQuestion: 0,
        answerState: null,
        quiz: [],
        loading: true,
    };

    onAnswerClickHandler = (answerId) => {

        if (this.state.answerState) {
            const key = Object.keys(this.state.answerState)[0]
            if (this.state.answerState[key] === 'success') {
                return
            }
        }
        const question = this.state.quiz[this.state.activeQuestion];
        const results = this.state.results;
        if (question.rightAnswerId === answerId) {
            if (!results[question.id]) {
                results[question.id] = 'success'
            }
            this.setState({
                answerState: {[answerId]: 'success'},
                results,
            });

            const timeout = window.setTimeout(() => {
                if (this.isQuizFinished()) {
                    this.setState({
                        isFinished: true
                    })
                } else {
                    this.setState({
                        activeQuestion: this.state.activeQuestion + 1,
                        answerState: null
                    })
                }

                window.clearTimeout(timeout)
            }, 1000)
        } else {
            results[question.id] = 'error';
            this.setState({
                answerState: {[answerId]: 'error'},
                results,
            })
        }
    };

    retryHandler = () => {
        this.setState({
            activeQuestion: 0,
            answerState: null,
            isFinished: false,
            results: {},

        })
    };

    isQuizFinished() {
        return this.state.activeQuestion + 1 === this.state.quiz.length
    }

    async componentDidMount() {
        try {
            const response = await axios.get(`/quizes/${this.props.match.params.id}.json`)
            const quiz = response.data

            this.setState({
                quiz,
                loading: false
            })
        } catch (e) {
            console.log(e)
        }
        console.log('Quiz ID = ', this.props.match.params.id)
    }

    render() {
        return (
            <div className={classes.Quiz}>
                <div className={classes.QuizWrapper}>
                    <h1>Answer all questions:</h1>
                    {
                        this.state.loading
                            ? <Loader/>
                            :
                            this.state.isFinished
                                ? <FinishedQuiz
                                    results={this.state.results}
                                    quiz={this.state.quiz}
                                    onRetry={this.retryHandler}
                                />
                                : <AciveQuiz
                                    answers={this.state.quiz[this.state.activeQuestion].answers}
                                    question={this.state.quiz[this.state.activeQuestion].question}
                                    onAnswerClick={this.onAnswerClickHandler}
                                    quizLenght={this.state.quiz.length}
                                    answerNumber={this.state.activeQuestion + 1}
                                    state={this.state.answerState}
                                />}
                </div>
            </div>

        )
    }
}

export default Quiz;