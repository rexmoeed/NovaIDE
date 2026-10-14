import { TemplateDefinition, ScaffoldingContext, PlannedFileItem } from '../../types/scaffolding';
import { generateReadme } from './shared';

// 1. Expo
export const mobileExpo: TemplateDefinition = {
  id: 'mobile-expo',
  name: 'Expo (React Native)',
  category: 'mobile',
  description: 'Cross-platform mobile application powered by Expo SDK 52, TypeScript, and file-based routing.',
  icon: '📱',
  badge: 'Recommended',
  languages: ['TypeScript', 'JavaScript'],
  frameworks: ['Expo SDK 52', 'React Native', 'React'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'feature-based',
  supportedArchitectures: ['feature-based', 'simple'],
  defaultPorts: { dev: 8081 },
  commands: {
    dev: 'npx expo start',
    build: 'npx expo export',
    test: 'npm test',
  },
  envVariables: [
    { key: 'EXPO_PUBLIC_API_URL', description: 'Backend API endpoint', defaultValue: 'https://api.example.com' },
  ],
  compatibleLibraries: [
    { id: 'expo-router', name: 'Expo Router', category: 'routing', description: 'File-based routing for mobile', defaultSelected: true, packageNames: ['expo-router'] },
  ],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Expo application manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '1.0.0',
        main: 'expo-router/entry',
        scripts: {
          start: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web',
          test: 'vitest run',
        },
        dependencies: {
          expo: '~52.0.0',
          'expo-status-bar': '~2.0.0',
          react: '18.3.1',
          'react-native': '0.76.6',
        },
        devDependencies: {
          typescript: '^5.3.3',
        },
      }, null, 2),
    },
    {
      id: 'app-json',
      path: 'app.json',
      description: 'Expo configuration',
      category: 'config',
      content: JSON.stringify({
        expo: {
          name: ctx.projectName,
          slug: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          version: '1.0.0',
          orientation: 'portrait',
        },
      }, null, 2),
    },
    {
      id: 'app-index',
      path: 'app/index.tsx',
      description: 'First mobile screen with sample card',
      category: 'source',
      content: `import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>${ctx.projectName}</Text>
        <Text style={styles.subtitle}>Expo SDK 52 + React Native Mobile App</Text>

        <TouchableOpacity style={styles.button} onPress={() => setCount(c => c + 1)}>
          <Text style={styles.buttonText}>Taps: {count}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#131b2e', padding: 24, borderRadius: 16, width: '100%', alignItems: 'center' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginVertical: 12 },
  button: { backgroundColor: '#4f46e5', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
`,
    },
  ],
};

// 2. React Native CLI
export const mobileReactNative: TemplateDefinition = {
  id: 'mobile-react-native',
  name: 'React Native',
  category: 'mobile',
  description: 'Pure React Native bare workflow with native iOS/Android bridge configurations.',
  icon: '⚛️',
  languages: ['TypeScript', 'JavaScript'],
  frameworks: ['React Native 0.76+'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'yarn'],
  defaultArchitecture: 'feature-based',
  supportedArchitectures: ['feature-based', 'modular'],
  defaultPorts: { dev: 8081 },
  commands: { dev: 'npx react-native start', build: 'npx react-native build-android', test: 'npm test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'React Native bare manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '0.0.1',
        private: true,
        scripts: { start: 'react-native start', android: 'react-native run-android', ios: 'react-native run-ios' },
        dependencies: { react: '18.3.1', 'react-native': '0.76.6' },
      }, null, 2),
    },
    {
      id: 'app-tsx',
      path: 'App.tsx',
      description: 'Root React Native component',
      category: 'source',
      content: `import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>${ctx.projectName}</Text>
    </SafeAreaView>
  );
}
`,
    },
  ],
};

// 3. Flutter (Dart)
export const mobileFlutter: TemplateDefinition = {
  id: 'mobile-flutter',
  name: 'Flutter',
  category: 'mobile',
  description: 'Idiomatic Flutter 3.24+ application with Dart, Material 3, and feature-first architecture.',
  icon: '💙',
  badge: 'Cross-Platform',
  languages: ['Dart'],
  frameworks: ['Flutter 3.24+', 'Material 3'],
  defaultPackageManager: 'go', // placeholder indicator
  supportedPackageManagers: ['go', 'npm'],
  defaultArchitecture: 'feature-based',
  supportedArchitectures: ['feature-based', 'clean'],
  defaultPorts: { dev: 0 },
  commands: { dev: 'flutter run', build: 'flutter build apk', test: 'flutter test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pubspec',
      path: 'pubspec.yaml',
      description: 'Flutter dependency manifest',
      category: 'config',
      content: `name: ${ctx.projectName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}
description: "${ctx.projectDescription || 'A new Flutter project.'}"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
    },
    {
      id: 'main-dart',
      path: 'lib/main.dart',
      description: 'Flutter main entry point',
      category: 'source',
      content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${ctx.projectName}',
      theme: ThemeData.dark(useMaterial3: true),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${ctx.projectName}')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('You have pushed the button this many times:'),
            Text('$_counter', style: Theme.of(context).textTheme.headlineMedium),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _counter++),
        child: const Icon(Icons.add),
      ),
    );
  }
}
`,
    },
    {
      id: 'test-widget',
      path: 'test/widget_test.dart',
      description: 'Flutter widget assertions',
      category: 'test',
      content: `import 'package:flutter_test/flutter_test.dart';
import 'package:${ctx.projectName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}/main.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('0'), findsOneWidget);
  });
}
`,
    },
  ],
};

// 4. Native Android (Kotlin)
export const mobileAndroid: TemplateDefinition = {
  id: 'mobile-android',
  name: 'Native Android',
  category: 'mobile',
  description: 'Native Android app with Kotlin, Jetpack Compose UI, and Gradle build toolchain.',
  icon: '🤖',
  languages: ['Kotlin'],
  frameworks: ['Android Jetpack Compose', 'Gradle'],
  defaultPackageManager: 'gradle',
  supportedPackageManagers: ['gradle'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 0 },
  commands: { dev: './gradlew assembleDebug', build: './gradlew build', test: './gradlew test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'build-gradle',
      path: 'build.gradle.kts',
      description: 'Root Gradle build file',
      category: 'config',
      content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
    },
    {
      id: 'main-activity',
      path: 'app/src/main/java/com/example/app/MainActivity.kt',
      description: 'Android Compose main activity',
      category: 'source',
      content: `package com.example.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Text(text = "Hello \${"${ctx.projectName}"}!")
        }
    }
}
`,
    },
  ],
};

// 5. Native iOS (Swift)
export const mobileIos: TemplateDefinition = {
  id: 'mobile-ios',
  name: 'Native iOS',
  category: 'mobile',
  description: 'Native iOS application built with Swift 6 and modern declarative SwiftUI.',
  icon: '🍎',
  languages: ['Swift'],
  frameworks: ['SwiftUI', 'Swift Package Manager'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 0 },
  commands: { dev: 'xcodebuild -scheme App', build: 'xcodebuild build', test: 'xcodebuild test' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'content-view',
      path: 'Sources/ContentView.swift',
      description: 'SwiftUI root view',
      category: 'source',
      content: `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Text("${ctx.projectName}")
                .font(.title)
                .bold()
            Text("SwiftUI Native Application")
                .foregroundColor(.secondary)
        }
        .padding()
    }
}
`,
    },
  ],
};

export const allMobileTemplates = [
  mobileExpo,
  mobileReactNative,
  mobileFlutter,
  mobileAndroid,
  mobileIos,
];
