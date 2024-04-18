import { FlatList, StyleSheet, View } from 'react-native'
import { useState } from 'react'
import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, ButtonGroup, CheckBox, Text } from '@rneui/themed'
import * as Font from 'expo-font'
import FontAwesome from '@expo/vector-icons/FontAwesome'



async function cacheFonts(fonts) {
  return fonts.map(async (font) => await Font.loadAsync(font))
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bigText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 25,
    paddingBottom: 25,
  },
  summaryText: {
    fontSize: 35,
    fontWeight: 'bold',
    padding: 15,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: 'bold',
    padding: 15,
  },
  answerButtons: {
    padding: 10,
    width: 400,
  },
  nextButton: {
    paddingTop: 20,
  },
})



const Stack = createNativeStackNavigator()

// correct answers: (1) bull shark, (2) whale shark and basking shark, (3) true
const questions = [
  {
    "prompt": "Which shark has been found in the Mississippi River as far inland as Illinois?",
    "type": "multiple-choice",
    "choices": [
      "Tiger Shark",
      "Reef Shark",
      "Bull Shark",
      "Nurse Shark",
    ],
    "correct": 2
  },
  {
    "prompt": "Which are in the top 5 biggest shark species?",
    "type": "multiple-answer",
    "choices": [
      "Whale Shark",
      "Spiny Dogfish",
      "Horn Shark",
      "Basking Shark",
    ],
    "correct": [0, 3]
  },
  {
    "prompt": "Blue sharks are actually blue.",
    "type": "true-false",
    "choices": [
      "True",
      "False",
    ],
    "correct": 0
  },
]


// used Murray's video/screenshots for help
export default function App() {
  cacheFonts([FontAwesome.font])

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Question'>
        <Stack.Screen
          name='Question'
          initialParams={{
            questionNumber: 0,
            data: questions,
            userChoices: [],
          }}
          options={{ headerShown: false }}
        >
          {(props) => <Question {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name='Summary'
          component={SummaryScreen}
          initialParams={{
            questionNumber: questions.length - 1,
            data: questions,
            userChoices: [[]],
          }}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}



export function Question({ route, navigation }) {
  cacheFonts([FontAwesome.font])
  const { data, userChoices, questionNumber } = route.params
  let { choices, prompt, type } = data[questionNumber]
  let [selectedIndex, setSelectedIndex] = useState(null)
  let [selectedIndexes, setSelectedIndexes] = useState([])

  let nextQuestion = () => {
    let nextQuestion = questionNumber + 1
    if (type !== 'multiple-answer') {
      userChoices.push(selectedIndex)
      console.log(selectedIndex)
    } else {
      userChoices.push(selectedIndexes)
      console.log(selectedIndexes)
    }
    if (nextQuestion < questions.length) {
      navigation.navigate('Question', {
        questionNumber: nextQuestion,
        questions,
        userChoices,
      })
    } else {
      navigation.navigate('Summary', {
        questionNumber: nextQuestion,
        questions,
        userChoices,
      })
    }
  }

  return (
    <View style={styles.container}>
      <Text
      style={styles.bigText}
      >{prompt}</Text>
      {type !== 'multiple-answer' ? (
        <ButtonGroup
          testID='choices'
          buttonStyle={styles.answerButtons}
          buttons={choices}
          vertical
          selectedIndex={selectedIndex}
          onPress={(value) => {
            setSelectedIndex(value)
          }}
        />
      ) : (
        <ButtonGroup
          testID='choices'
          buttonStyle={styles.answerButtons}
          buttons={choices}
          vertical
          selectMultiple
          selectedIndexes={selectedIndexes}
          onPress={(value) => {
            setSelectedIndexes(value)
          }}
        />
      )}
      <Button
        testID='next-question'
        style={styles.nextButton}
        onPress={nextQuestion}
        title='Next'
      />
    </View>
  )
}

export function SummaryScreen({ route }) {
  cacheFonts([FontAwesome.font])
  let calculateCorrect = (userSelected, correct, type) => {
    let userCorrect = false
    if (type == 'multiple-answer') {
      userCorrect = userSelected.sort().toString() === correct.sort().toString()
    } else {
      userCorrect = userSelected == correct
    }
    return userCorrect
  }
  let calculateCorrectSet = (userSelected, correct, type) => {
    let userCorrect = false
    if (type == 'multiple-answer') {
      userCorrect =
        correct.every((item) => userSelected.includes(item)) &&
        userSelected.every((item) => correct.includes(item))
    } else {
      userCorrect = userSelected == correct
    }
    return userCorrect
  }
  let totalScore = 0
  for (let i = 0; i < route.params.data.length; i++) {
    if (
      calculateCorrect(
        route.params.userChoices[i],
        route.params.data[i].correct,
        route.params.data[i].type
      )
    ) {
      totalScore++
    }
  }

  return (
    <View style={styles.container}>
      <Text
      style={styles.summaryText}
      >Summary</Text>
      <Text testID='total'
      style={styles.scoreText}
      >Score: {totalScore}/3</Text>
      <FlatList
        data={route.params.data}
        renderItem={({ item, index }) => {
          let { choices, prompt, type, correct } = item
          let userSelected = route.params.userChoices[index]
          let userCorrect = calculateCorrect(userSelected, correct, type)

          return (
            <View key={index}>
              <Text
              style={styles.bigText}
              >{prompt}</Text>
              {choices.map((value, choiceIndex) => {
                let incorrect = false
                let userDidSelect = false
                if (type == 'multiple-answer') {
                  userDidSelect = userSelected.includes(choiceIndex)
                  incorrect = userDidSelect && !correct.includes(choiceIndex)
                } else {
                  userDidSelect = userSelected == choiceIndex
                  incorrect = userDidSelect && userSelected !== correct
                }
                return (
                  <CheckBox
                    containerStyle={{
                      backgroundColor: userDidSelect
                      ? incorrect == false
                      ? 'lightgreen'
                      : 'gray'
                      : undefined,
                    }}
                    checked={
                      type == 'multiple-answer'
                      ? correct.includes(choiceIndex)
                      : correct == choiceIndex
                    }
                    textStyle={{
                      textDecorationLine: incorrect
                      ? 'line-through'
                      : undefined,
                    }}
                    key={value}
                    title={value}
                  ></CheckBox>
                )
              })}
            </View>
          )
        }}
      ></FlatList>
    </View>
  )
}


