import {Text, View, StyleSheet } from '@react-pdf/renderer';

const borderColor = '#90e5fc'
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        backgroundColor: '#bff0fd',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        textAlign: 'center',
        fontStyle: 'bold',
        flexGrow: 1,
    },
    inference: {
        width: '60%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        fontFamily: "Helvetica-Bold"
    },
    angle: {
        width: '40%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        fontFamily: "Helvetica-Bold"
    }
  });

  export const TableHeader = () => (
    <View style={styles.container}>
        <Text style={styles.inference}>Inference</Text>
        <Text style={styles.angle}>Tilt (in degrees)</Text>
    </View>
  );