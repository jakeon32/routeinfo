import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Station } from '../models/Station';
import { Stop } from '../models/Stop';

const stationRepository = AppDataSource.getRepository(Station);
const stopRepository = AppDataSource.getRepository(Stop);

// 모든 정거장 조회
export const getAllStations = async (req: Request, res: Response) => {
  try {
    const stations = await stationRepository.find({
      relations: ['stops', 'primaryStop'],
      order: {
        createdAt: 'DESC'
      }
    });

    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ message: 'Failed to fetch stations', error });
  }
};

// 특정 정거장 조회
export const getStationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const station = await stationRepository.findOne({
      where: { stationId: parseInt(id) },
      relations: ['stops', 'primaryStop']
    });

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Error fetching station:', error);
    res.status(500).json({ message: 'Failed to fetch station', error });
  }
};

// 정거장 생성
export const createStation = async (req: Request, res: Response) => {
  try {
    const { name, primaryStopId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Station name is required' });
    }

    // primaryStopId가 있으면 해당 Stop이 존재하는지 확인
    if (primaryStopId) {
      const stop = await stopRepository.findOne({
        where: { stopId: primaryStopId }
      });
      if (!stop) {
        return res.status(400).json({ message: 'Primary stop not found' });
      }
    }

    const station = stationRepository.create({
      name,
      primaryStopId: primaryStopId || null
    });

    const savedStation = await stationRepository.save(station);

    // 생성된 정거장을 관계 포함해서 다시 조회
    const result = await stationRepository.findOne({
      where: { stationId: savedStation.stationId },
      relations: ['stops', 'primaryStop']
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ message: 'Failed to create station', error });
  }
};

// 정거장 수정
export const updateStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, primaryStopId, isActive } = req.body;

    const station = await stationRepository.findOne({
      where: { stationId: parseInt(id) }
    });

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // primaryStopId가 있으면 해당 Stop이 이 Station에 속하는지 확인
    if (primaryStopId) {
      const stop = await stopRepository.findOne({
        where: { stopId: primaryStopId, stationId: parseInt(id) }
      });
      if (!stop) {
        return res.status(400).json({
          message: 'Primary stop must belong to this station'
        });
      }
    }

    // 업데이트
    if (name !== undefined) station.name = name;
    if (primaryStopId !== undefined) station.primaryStopId = primaryStopId;
    if (isActive !== undefined) station.isActive = isActive;

    await stationRepository.save(station);

    // 업데이트된 정거장을 관계 포함해서 다시 조회
    const result = await stationRepository.findOne({
      where: { stationId: parseInt(id) },
      relations: ['stops', 'primaryStop']
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ message: 'Failed to update station', error });
  }
};

// 정거장 삭제
export const deleteStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const station = await stationRepository.findOne({
      where: { stationId: parseInt(id) }
    });

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    await stationRepository.remove(station);

    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Failed to delete station', error });
  }
};
